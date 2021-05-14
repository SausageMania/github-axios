import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Paper, Dialog, Typography } from '@material-ui/core';
import { TreeView, TreeItem } from '@material-ui/lab';
import { ExpandMore, ChevronRight } from '@material-ui/icons';
import Highlight from 'react-highlight';

const App = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [main, setMain] = useState(null);
    const [content, setContent] = useState(null);
    const [extension, setExtension] = useState(null);
    const [type, setType] = useState(null);

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

    useEffect(() => {
        if (extension) {
            const last = extension.length - 1;
            if (extension[last] === 'js') {
                setType('language-javascript');
            } else setType(`language-${extension[last]}`);
        }
    }, [extension]);

    console.log(type);

    if (loading) return <div>로딩중...</div>;
    if (error) return <div>{error}</div>;
    return (
        <Dialog open fullWidth maxWidth="lg">
            <Box width="100%" height="80vh" display="flex" component={Paper}>
                <Box
                    overflow="auto"
                    width="25%"
                    style={{ backgroundColor: '#F59F00', color: 'white' }}
                    p={2}
                >
                    <TreeView
                        defaultCollapseIcon={<ExpandMore />}
                        defaultExpandIcon={<ChevronRight />}
                    >
                        <DirectoryInto
                            main={main}
                            setContent={setContent}
                            setExtension={setExtension}
                        />
                    </TreeView>
                </Box>

                <Box overflow="auto" width="75%" style={{ backgroundColor: '#011627' }}>
                    {content ? (
                        <Highlight className={type} style={{ whiteSpace: 'pre-wrap' }}>
                            {content}
                        </Highlight>
                    ) : (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            color="white"
                            height="100%"
                        >
                            <Typography>코드를 먼저 선택해주세요.</Typography>
                        </Box>
                    )}

                    {/* <pre>
                            <code
                                className="language-javascript"
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                {content}
                            </code>
                        </pre> */}
                </Box>
            </Box>
        </Dialog>
    );
};

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

// const ShowContent = () => {};

export default App;
