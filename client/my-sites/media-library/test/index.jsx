/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaLibrary from '..';
import { requestKeyringConnections as requestStub } from 'calypso/state/sharing/keyring/actions';

jest.mock( 'calypso/components/data/query-preferences', () =>
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
	requestKeyringConnections: require( 'sinon' ).stub(),
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
				queryRequests: {},
				mediaItemRequests: {},
				selectedItems: {},
			},
		} ),
		dispatch: () => false,
		subscribe: () => false,
	};

	beforeEach( () => {
		requestStub.resetHistory();
	} );

	const getItem = ( source ) => mount( <MediaLibrary store={ store } source={ source } /> );

	describe( 'keyring request', () => {
		test( 'is issued when component mounted and viewing an external source', () => {
			getItem( 'google_photos' );

			expect( requestStub.callCount ).to.equal( 1 );
		} );

		test( 'is not issued when component mounted and viewing wordpress', () => {
			getItem( '' );

			expect( requestStub.callCount ).to.equal( 0 );
		} );

		test( 'is issued when component source changes and now viewing an external source', () => {
			const library = getItem( '' );

			library.setProps( { source: 'google_photos' } );
			expect( requestStub.callCount ).to.equal( 1 );
		} );

		test( 'is not issued when component source changes and not viewing an external source', () => {
			const library = getItem( '' );

			library.setProps( { source: '' } );
			expect( requestStub.callCount ).to.equal( 0 );
		} );

		test( 'is not issued when the external source does not need user connection', () => {
			getItem( 'pexels' );

			expect( requestStub.callCount ).to.equal( 0 );
		} );
	} );
} );
