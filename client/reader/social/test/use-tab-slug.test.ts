/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { renderHook } from '@testing-library/react';
import { useTabSlug } from '../use-tab-slug';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn() },
} ) );
const pageReplace = jest.mocked( page.replace );

const ALLOWED = [ 'posts', 'replies', 'media' ] as const;

function setSearch( search: string ) {
	window.history.replaceState( {}, '', `/x${ search }` );
}

beforeEach( () => {
	pageReplace.mockClear();
	setSearch( '' );
} );

describe( 'useTabSlug', () => {
	it( 'returns the default slug when ?tab= is absent', () => {
		const { result } = renderHook( () =>
			useTabSlug( { allowedSlugs: ALLOWED, defaultSlug: 'posts' } )
		);
		expect( result.current ).toEqual( { slug: 'posts', isDefault: true } );
		expect( pageReplace ).not.toHaveBeenCalled();
	} );

	it( 'returns the slug verbatim when it is in allowedSlugs', () => {
		setSearch( '?tab=replies' );
		const { result } = renderHook( () =>
			useTabSlug( { allowedSlugs: ALLOWED, defaultSlug: 'posts' } )
		);
		expect( result.current ).toEqual( { slug: 'replies', isDefault: false } );
		expect( pageReplace ).not.toHaveBeenCalled();
	} );

	it( 'rewrites a malformed ?tab= to the default exactly once per value', () => {
		setSearch( '?tab=garbage' );
		const { result, rerender } = renderHook( () =>
			useTabSlug( { allowedSlugs: ALLOWED, defaultSlug: 'posts' } )
		);
		expect( result.current.slug ).toBe( 'posts' );
		expect( pageReplace ).toHaveBeenCalledTimes( 1 );
		expect( pageReplace ).toHaveBeenCalledWith( '/x?tab=posts' );
		// Re-rendering with the same malformed value must not loop.
		rerender();
		expect( pageReplace ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not rewrite when the URL has changed to a valid slug since render', () => {
		setSearch( '?tab=garbage' );
		const { rerender } = renderHook( () =>
			useTabSlug( { allowedSlugs: ALLOWED, defaultSlug: 'posts' } )
		);
		// Simulate a same-batch tab click that landed before our effect commits.
		setSearch( '?tab=media' );
		pageReplace.mockClear();
		rerender();
		expect( pageReplace ).not.toHaveBeenCalled();
	} );
} );
