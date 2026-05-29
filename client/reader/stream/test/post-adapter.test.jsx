/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReaderPostCardAdapter from '../post';

jest.mock( 'calypso/blocks/reader-post-card', () => ( props ) => (
	<div
		data-testid="reader-post-card"
		data-comments-api-disabled={ String( props.commentsApiDisabled ) }
	>
		{ props.children }
	</div>
) );

jest.mock( 'calypso/reader/data/site', () => ( {
	withSite: ( WrappedComponent ) => ( props ) => <WrappedComponent { ...props } />,
} ) );

const renderPost = ( { post, queryClient = new QueryClient() } ) => {
	const store = createStore(
		(
			state = {
				reader: {
					follows: { items: {} },
				},
			}
		) => state
	);

	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<ReaderPostCardAdapter post={ post } />
			</Provider>
		</QueryClientProvider>
	);
};

describe( 'ReaderPostCardAdapter', () => {
	it( 'passes cached comments API disabled state to internal post cards', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( [ 'site', 'comments', 'api-disabled', 100 ], true );

		renderPost( {
			queryClient,
			post: {
				ID: 1,
				site_ID: 100,
				is_external: false,
			},
		} );

		expect( screen.getByTestId( 'reader-post-card' ) ).toHaveAttribute(
			'data-comments-api-disabled',
			'true'
		);
	} );

	it( 'keeps comments API enabled for external post cards', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( [ 'site', 'comments', 'api-disabled', 100 ], true );

		renderPost( {
			queryClient,
			post: {
				ID: 1,
				site_ID: 100,
				is_external: true,
			},
		} );

		expect( screen.getByTestId( 'reader-post-card' ) ).toHaveAttribute(
			'data-comments-api-disabled',
			'false'
		);
	} );
} );
