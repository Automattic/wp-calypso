/**
 * External dependencies
 */
import { expect } from 'chai';
import page from 'page';

/**
 * Internal dependencies
 */
import searchUrl from '..';
import { useSandbox } from 'test/helpers/use-sinon';

const SEARCH_KEYWORD = 'giraffe';

describe( 'SearchUrl', () => {
	let onSearch, onReplace, onPage;

	useSandbox( ( sandbox ) => {
		onSearch = sandbox.stub();
		onReplace = sandbox.stub( page, 'replace' );
		onPage = sandbox.stub( page, 'show' );
	} );

	test( 'should call onSearch if provided', () => {
		searchUrl( SEARCH_KEYWORD, '', onSearch );

		expect( onSearch ).to.have.been.calledWith( SEARCH_KEYWORD );
	} );

	test( 'should replace existing search keyword', () => {
		global.window = { location: { href: 'http://example.com/cat' } };

		searchUrl( SEARCH_KEYWORD, 'existing' );

		expect( onReplace ).to.have.been.calledWith( '/cat?s=' + SEARCH_KEYWORD );
	} );

	test( 'should set page URL if no existing keyword', () => {
		global.window = { location: { href: 'http://example.com/cat' } };

		searchUrl( SEARCH_KEYWORD );

		expect( onPage ).to.have.been.calledWith( '/cat?s=' + SEARCH_KEYWORD );
	} );
} );
