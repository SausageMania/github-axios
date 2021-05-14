# github-axios

## 1. 구현한 내용
axios를 이용하여 github rest api를 연결함.  
이를 통해 git repository와 코드를 모두 확인할 수 있음.
코드블럭의 경우, highlight.js를 react버젼에 맞게 커스터마이징하여 사용했음.  

## 2. 구현 단계
async, await를 이용하여 data를 먼저 받을 수 있도록 하였음.  
가장 최근 커밋의 repository의 url을 불러오는 방식.  
```javascript

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setError(null);
                setLoading(true);
                const response = await axios.get(
                    'https://api.github.com/repos/SausageMania/React-Board/commits',
                );
                setMain(
                    `https://api.github.com/repos/SausageMania/React-Board/git/trees/${response.data[0].sha}`,
                );
            } catch (e) {
                setError(e);
            }
            setLoading(false);
        };
        fetchUsers();

        return () => {
            setError(null);
            setLoading(true);
            setMain(null);
        };
    }, []);

```
tree구조로 작성되었으며(material-ui 사용) depth가 얼마나 있을지 모르므로  
recursive function으로 directory가 아닌 file이 나올 때까지 호출함.  

```javascript
    const DirectoryInto = props => {
    const { main, setContent, setExtension } = props;
    const [directory, setDirectory] = useState(null);
    const [blob, setBlob] = useState(null);

    const fetchUsers = useCallback(async () => {
        if (main) {
            const response = await axios.get(main);
            setDirectory(response.data.tree);
        }
    }, [main]);

    useEffect(() => {
        fetchUsers();

        return () => {
            setDirectory(null);
        };
    }, [fetchUsers]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(blob);
                setContent(atob(response.data.content));
            } catch (e) {
                console.log(e);
            }
        };
        if (blob) {
            fetchUsers();
        }
    }, [blob, setContent, setExtension]);

    return (
        <React.Fragment>
            {directory &&
                directory.map(data => (
                    <TreeItem
                        key={data.sha}
                        nodeId={data.sha}
                        label={data.path}
                        onClick={() => {
                            if (data.type === 'blob') {
                                setBlob(data.url);
                                setExtension(data.path.split('.'));
                            }
                        }}
                    >
                        {data.type === 'tree' && (
                            <DirectoryInto
                                main={data.url}
                                setContent={setContent}
                                setExtension={setExtension}
                            />
                        )}
                    </TreeItem>
                ))}
        </React.Fragment>
    );
};
```

이 코드가 핵심 부분.
```javascript
    {data.type === 'tree' && (
     <DirectoryInto
        main={data.url}
        setContent={setContent}
        setExtension={setExtension}
     />
     )}
```

## 3. 발견한 문제
의외로 api사용에선 문제가 없었음.  
### I. 재귀함수
재귀함수 호출 시 setError를 설정하고 component return 전에
```javascript
    if(error) return <div>{error}</div>
```
로 작성했는데 초기 렌더링 시엔 데이터가 없기 때문에 해당 부분에서 문제가 발생했음.  
-> error가 발생할 시 console.log로 띄우도록 변경함.  

### II. highlight.js
원래 react버젼이 아니기에 호환에서 문제가 발생함.
<Highlight>태그에 원래는
```javascript
  <Highlight language={type}> </Highlight>
```
    
였으나 language가 정상작동하지 않음. 따라서 이 코드를
```javascript
  <Highlight className={type}> </Highlight>
```
으로 바꿔 css에 직접 접근할 수 있도록 수정함.

