/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

const emptyComponent = () => null;

describe( 'MediaLibrary', () => {
	let MediaLibrary, requestStub;

	useFakeDom();
	useMockery();

	const store = {
		getState: () => ( {} ),
		dispatch: () => false,
		subscribe: () => false,
	};

	useMockery( mockery => {
		requestStub = stub();
		mockery.registerMock( 'components/data/query-preferences', emptyComponent );
		mockery.registerMock( './filter-bar', emptyComponent );
		mockery.registerMock( './content', emptyComponent );
		mockery.registerMock( './drop-zone', emptyComponent );
		mockery.registerMock( 'components/data/media-validation-data', emptyComponent );
		mockery.registerMock( 'lib/media/library-selected-store', emptyComponent );
		mockery.registerMock( 'lib/media/actions', emptyComponent );
		mockery.registerMock( 'state/sharing/keyring/selectors', {
			getKeyringConnections: emptyComponent,
			isKeyringConnectionsFetching: emptyComponent,
		} );
		mockery.registerMock( 'state/sharing/keyring/actions', {
			requestKeyringConnections: requestStub
		} );
	} );

	before( () => {
		MediaLibrary = require( '..' );
	} );

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
