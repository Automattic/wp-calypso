/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { upsertReaderPostCache } from 'calypso/reader/data/reader-post-cache';
import DialogContent from '../dialog-content';

jest.mock( '@automattic/components', () => ( {
	EmbedContainer: ( { children } ) => <div>{ children }</div>,
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	useLocale: () => 'en',
} ) );

jest.mock( '@automattic/support-articles', () => ( {
	SupportArticleHeader: ( { post, isLoading } ) => (
		<div data-testid="support-article-header" data-loading={ String( isLoading ) }>
			{ post?.title }
		</div>
	),
} ) );

jest.mock( 'calypso/components/data/query-reader-post', () => ( {
	__esModule: true,
	default: () => <div data-testid="query-reader-post" />,
} ) );

jest.mock( 'calypso/components/data/query-reader-site', () => ( {
	__esModule: true,
	default: () => <div data-testid="query-reader-site" />,
} ) );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

describe( 'DialogContent', () => {
	it( 'renders a support article from the canonical Reader post cache', () => {
		const queryClient = makeQueryClient();
		upsertReaderPostCache( queryClient, [
			{
				ID: 123,
				site_ID: 456,
				global_ID: 'support-article-123',
				title: 'Cached support article',
				content: '<p>Cached support article body</p>',
			},
		] );

		render(
			<QueryClientProvider client={ queryClient }>
				<DialogContent blogId={ 456 } postId={ 123 } />
			</QueryClientProvider>
		);

		expect( screen.getByTestId( 'support-article-header' ) ).toHaveTextContent(
			'Cached support article'
		);
		expect( screen.getByTestId( 'support-article-header' ) ).toHaveAttribute(
			'data-loading',
			'false'
		);
		expect( screen.getByText( 'Cached support article body' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'query-reader-post' ) ).not.toBeInTheDocument();
	} );
} );
