/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReaderPostOptionsMenu from '..';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( WrappedComponent ) => ( props ) => (
		<WrappedComponent { ...props } translate={ ( text ) => text } />
	),
} ) );

jest.mock( 'calypso/components/data/with-reader-teams', () => ( {
	withReaderTeams: ( WrappedComponent ) => ( props ) => (
		<WrappedComponent { ...props } teams={ [] } />
	),
} ) );

jest.mock( 'calypso/reader/data/site', () => ( {
	withSite: ( WrappedComponent ) => ( props ) => (
		<WrappedComponent
			{ ...props }
			site={ props.siteId ? { ID: props.siteId, URL: 'https://example.com' } : undefined }
		/>
	),
} ) );

jest.mock( '../reader-post-ellipsis-menu', () => ( { site } ) => (
	<div data-testid="ellipsis-site-id">{ site?.ID ?? 'none' }</div>
) );

const store = createStore( ( state = { reader: { follows: { items: {} } } } ) => state );

describe( 'ReaderPostOptionsMenu', () => {
	test( 'passes the post site ID through withSite before rendering the menu', () => {
		const queryClient = new QueryClient();
		render(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>
					<ReaderPostOptionsMenu
						post={ {
							ID: 1,
							site_ID: 123,
							feed_ID: 0,
							is_external: false,
						} }
					/>
				</Provider>
			</QueryClientProvider>
		);

		expect( screen.getByTestId( 'ellipsis-site-id' ) ).toHaveTextContent( '123' );
	} );
} );
