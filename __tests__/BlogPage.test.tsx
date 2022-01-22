import '@testing-library/jest-dom/extend-expect';
import { render, screen, cleanup } from '@testing-library/react';

import { getPage } from 'next-page-tester';
import { initTestHelpers } from 'next-page-tester';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import 'setimmediate';

initTestHelpers();

const handlers = [
  rest.get(
    'https://jsonplaceholder.typicode.com/posts/?_limit=10',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            userId: 1,
            id: 1,
            title: 'dummy title 1',
            body: 'dummy body 1',
          },
          {
            userId: 2,
            id: 2,
            title: 'dummy title 2',
            body: 'dummy body 2',
          },
        ])
      );
    }
  ),
];

const server = setupServer(...handlers); //サーバーを立てる
//テストファイルの最初に実行
beforeAll(() => {
  server.listen();
});
//各テストが終わるたびに
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
//このファイル内の全てのテストが終了した時に実行
afterAll(() => {
  server.close();
});

describe('Blog page', () => {
  it('Should render the list of blogs pre-fetched by getStaticProps', async () => {
    const { page } = await getPage({
      route: '/blog-page',
    });
    render(page);
    expect(await screen.findByText('blog page')).toBeInTheDocument();
    expect(screen.getByText('dummy title 1')).toBeInTheDocument();
    expect(screen.getByText('dummy title 2')).toBeInTheDocument();
  });
});
