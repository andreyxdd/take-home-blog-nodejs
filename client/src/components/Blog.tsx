import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import { PostProps } from '../types';
import { getPosts } from '../services/blog';

const theme = createTheme();

const sampleSections = [
  {
    title: 'Home',
    url: '/home',
  },
  {
    title: 'About',
    url: '/about',
  },
  {
    title: 'Contact',
    url: '/contact',
  },
];

export default function Blog() {
  const [posts, setPosts] = React.useState<Array<PostProps>>([]);
  const [totalPages, setTotalPages] = React.useState<number>(0);

  React.useEffect(() => {
    getPosts(1, 3)
      .then((results) => {
        console.log(results);
        setTotalPages(results.totalPages);
        setPosts(results.data);
      });
  }, []);

  const [page, setPage] = React.useState(1);
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    getPosts(value, 3)
      .then((results) => {
        console.log(results);
        setTotalPages(results.totalPages);
        setPosts(results.data);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title="Take Home Blog Node.js" sections={sampleSections} />
        <main>
          <Grid container spacing={3} sx={{ mt: 3 }} justifyContent="center">
            <Main posts={posts} mainTitle="Posts" />
          </Grid>
        </main>
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Stack spacing={2} justifyContent="center">
            <Pagination count={totalPages} page={page} onChange={handleChange} />
          </Stack>
        </Box>
      </Container>
      <Footer
        title="Small take home project"
        description="Proudly created by Andrei Volkov"
      />
    </ThemeProvider>
  );
}