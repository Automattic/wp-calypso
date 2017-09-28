/** @jest-environment jsdom */
jest.mock( 'components/data/query-preferences', () => require( 'components/empty-component' ) );
jest.mock( 'components/data/media-validation-data', () => require( 'components/empty-component' ) );
jest.mock( 'lib/media/library-selected-store', () => () => null );
jest.mock( 'lib/media/actions', () => () => null );
jest.mock( 'my-sites/media-library/content', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/media-library/drop-zone', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/media-library/filter-bar', () => require( 'components/empty-component' ) );
jest.mock( 'state/sharing/keyring/actions', () => ( {
	requestKeyringConnections: require( 'sinon' ).stub()
} ) );
jest.mock( 'state/sharing/keyring/selectors', () => ( {
	getKeyringConnections: () => null,
	isKeyringConnectionsFetching: () => null,
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import MediaLibrary from '..';
import { requestKeyringConnections as requestStub } from 'state/sharing/keyring/actions';

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

	context( 'keyring request', () => {
		it( 'is issued when component mounted and viewing an external source', () => {
			getItem( 'google_photos' );

			expect( requestStub ).to.have.been.calledOnce;
		} );

		it( 'is not issued when component mounted and viewing wordpress', () => {
			getItem( '' );

			expect( requestStub ).to.have.not.been.notCalled;
		} );

		it( 'is issued when component source changes and now viewing an external source', () => {
			const library = getItem( '' );

			library.setProps( { source: 'google_photos' } );
			expect( requestStub ).to.have.been.calledOnce;
		} );

		it( 'is not issued when component source changes and not viewing an external source', () => {
			const library = getItem( '' );

			library.setProps( { source: '' } );
			expect( requestStub ).to.have.not.been.notCalled;
		} );
	} );
} );
