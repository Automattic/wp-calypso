/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { requestKeyringConnections as requestStub } from 'calypso/state/sharing/keyring/actions';
import MediaLibrary from '..';

jest.mock( 'calypso/components/data/query-preferences', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/components/data/query-site-features', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/my-sites/media-library/content', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/my-sites/media-library/drop-zone', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/my-sites/media-library/filter-bar', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/state/sharing/keyring/actions', () => ( {
	requestKeyringConnections: jest.fn(),
} ) );
jest.mock( 'calypso/state/sharing/keyring/selectors', () => ( {
	getKeyringConnections: () => null,
	isKeyringConnectionsFetching: () => null,
} ) );

describe( 'MediaLibrary', () => {
	const store = {
		getState: () => ( {
			media: {
				errors: {},
				queries: {},
				selectedItems: {},
			},
			sites: [],
		} ),
		dispatch: () => false,
		subscribe: () => false,
	};

	const site = {
		ID: 123,
	};

	const props = {
		site,
		store,
	};

	const getItem = ( source ) => render( <MediaLibrary { ...props } source={ source } /> );

	describe( 'keyring request', () => {
		afterEach( () => {
			requestStub.mockReset();
		} );

		test( 'is issued when component mounted and viewing an external source', () => {
			getItem( 'google_photos' );

			expect( requestStub ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'is not issued when component mounted and viewing wordpress', () => {
			getItem( '' );

			expect( requestStub ).toHaveBeenCalledTimes( 0 );
		} );

		test( 'is issued when component source changes and now viewing an external source', () => {
			const { rerender } = getItem( '' );

			rerender( <MediaLibrary { ...props } source="google_photos" /> );
			expect( requestStub ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'is not issued when component source changes and not viewing an external source', () => {
			const { rerender } = getItem( '' );

			rerender( <MediaLibrary { ...props } source="" /> );
			expect( requestStub ).toHaveBeenCalledTimes( 0 );
		} );

		test( 'is not issued when the external source does not need user connection', () => {
			getItem( 'pexels' );

			expect( requestStub ).toHaveBeenCalledTimes( 0 );
		} );
	} );
} );
