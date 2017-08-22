/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import { useSandbox } from 'test/helpers/use-sinon';

const SEARCH_KEYWORD = 'giraffe';

describe( 'SearchUrl', () => {
	let onSearch, searchUrl, onReplace, onPage;

	useMockery();

	useSandbox( sandbox => {
		onSearch = sandbox.stub();
		onReplace = sandbox.stub();
		onPage = sandbox.stub();
	} );

	before( () => {
		mockery.registerMock( 'page', {
			replace: onReplace,
			show: onPage,
		} );

		searchUrl = require( '..' );
	} );

	it( 'should call onSearch if provided', () => {
		searchUrl( SEARCH_KEYWORD, '', onSearch );

		expect( onSearch ).to.have.been.calledWith( SEARCH_KEYWORD );
	} );

	it( 'should replace existing search keyword', () => {
		global.window = { location: { href: 'http://example.com/cat' } };

		searchUrl( SEARCH_KEYWORD, 'existing' );

		expect( onReplace ).to.have.been.calledWith( '/cat?s=' + SEARCH_KEYWORD );
	} );

	it( 'should set page URL if no existing keyword', () => {
		global.window = { location: { href: 'http://example.com/cat' } };

		searchUrl( SEARCH_KEYWORD );

		expect( onPage ).to.have.been.calledWith( '/cat?s=' + SEARCH_KEYWORD );
	} );
} );
