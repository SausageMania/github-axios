import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Paper, Dialog, Typography, Button, IconButton } from '@material-ui/core';
import { TreeView, TreeItem } from '@material-ui/lab';
import { Folder, InsertDriveFileOutlined, Cancel } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import Highlight from 'react-highlight';

const App = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [main, setMain] = useState(null);
    const [content, setContent] = useState(null);
    const [extension, setExtension] = useState(null);
    const [type, setType] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setError(null);
                setLoading(true);
                const response = await axios.get(
                    'https://api.github.com/repos/Vus-2021/Vus-frontend/commits',
                );
                setMain(
                    `https://api.github.com/repos/Vus-2021/Vus-frontend/git/trees/${response.data[0].sha}`,
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

    if (loading) return <div>로딩중...</div>;
    if (error) return <div>{error}</div>;
    return (
        <Box component="div">
            <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
                <Button
                    variant="contained"
                    onClick={() => setOpen(true)}
                    onMouseOver={() => console.log('hi!')}
                >
                    Github 열기
                </Button>
            </Box>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
                <Box
                    position="absolute"
                    top="0"
                    right="0"
                    zIndex="1"
                    onClick={() => setOpen(false)}
                >
                    <IconButton>
                        <Cancel style={{ color: 'white' }} />
                    </IconButton>
                </Box>
                <Box width="100%" height="80vh" display="flex" component={Paper}>
                    <Box
                        overflow="auto"
                        width="25%"
                        style={{ backgroundColor: '#F59F00', color: 'white' }}
                        p={2}
                    >
                        <TreeView
                            defaultCollapseIcon={<Folder />}
                            defaultExpandIcon={<Folder />}
                            defaultEndIcon={<InsertDriveFileOutlined />}
                        >
                            <DirectoryInto
                                main={main}
                                setContent={setContent}
                                setExtension={setExtension}
                            />
                        </TreeView>
                    </Box>

                    <Box overflow="auto" width="75%" style={{ backgroundColor: '#282c34' }} px={2}>
                        {content ? (
                            <Highlight className={type}>{content}</Highlight>
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
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
};

const DirectoryInto = props => {
    const classes = useStyles();
    const { main, setContent, setExtension } = props;
    const [directory, setDirectory] = useState(null);
    const [blob, setBlob] = useState(null);

    const fetchFiles = useCallback(async () => {
        if (main) {
            const response = await axios.get(main);
            setDirectory(response.data.tree);
        }
    }, [main]);

    useEffect(() => {
        fetchFiles();

        return () => {
            setDirectory(null);
        };
    }, [fetchFiles]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(blob);
                setContent(atob(response.data.content));
            } catch (e) {
                console.log(e);
            }
        };
        if (blob) {
            fetchFiles();
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
                        className={classes.treeAnimation}
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

const useStyles = makeStyles(theme => ({
    treeAnimation: {
        animation: `$fadein 1500ms`,
        WebkitAnimation: `$fadein 1500ms`,
    },
    '@keyframes fadein': {
        '0%': { opacity: 0, transform: 'translate(-20px)' },
        '100%': { opacity: 1, transform: 'translate(0px)' },
    },
}));

export default App;
