/**
 * @format
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
import { requestKeyringConnections as requestStub } from 'state/sharing/keyring/actions';

jest.mock( 'components/data/query-preferences', () => require( 'components/empty-component' ) );
jest.mock( 'components/data/media-validation-data', () => require( 'components/empty-component' ) );
jest.mock( 'lib/media/library-selected-store', () => () => null );
jest.mock( 'lib/media/actions', () => () => null );
jest.mock( 'my-sites/media-library/content', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/media-library/drop-zone', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/media-library/filter-bar', () => require( 'components/empty-component' ) );
jest.mock( 'state/sharing/keyring/actions', () => ( {
	requestKeyringConnections: require( 'sinon' ).stub(),
} ) );
jest.mock( 'state/sharing/keyring/selectors', () => ( {
	getKeyringConnections: () => null,
	isKeyringConnectionsFetching: () => null,
} ) );

describe( 'MediaLibrary', () => {
	const store = {
		getState: () => ( {} ),
		dispatch: () => false,
		subscribe: () => false,
	};

	beforeEach( () => {
		requestStub.reset();
	} );

	const getItem = source => mount( <MediaLibrary store={ store } source={ source } /> );

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
