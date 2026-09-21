/**
 * @jest-environment jsdom
 */
import getExploreMoreUrl from '../get-explore-more-url';

const FALLBACK = 'https://example.com/wp-admin/admin.php?page=stats#!/stats/day/1';

const renderMenu = ( hrefs ) => {
	document.body.innerHTML = `<ul id="adminmenu">${ hrefs
		.map( ( href ) => `<li><a href="${ href }">Item</a></li>` )
		.join( '' ) }</ul>`;
};

describe( 'getExploreMoreUrl', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'prefers My Jetpack over its deep links and Settings', () => {
		renderMenu( [
			'admin.php?page=my-jetpack#/add-videopress',
			'admin.php?page=jetpack#/settings',
			'admin.php?page=my-jetpack',
		] );
		expect( getExploreMoreUrl( FALLBACK ) ).toMatch( /admin\.php\?page=my-jetpack$/ );
	} );

	it( 'falls back to Jetpack Settings when My Jetpack is missing', () => {
		renderMenu( [ 'admin.php?page=jetpack-social', 'admin.php?page=jetpack#/settings' ] );
		expect( getExploreMoreUrl( FALLBACK ) ).toMatch( /admin\.php\?page=jetpack#\/settings$/ );
	} );

	it( 'falls back to the given URL when there is no Jetpack menu', () => {
		renderMenu( [ 'index.php', 'edit.php' ] );
		expect( getExploreMoreUrl( FALLBACK ) ).toBe( FALLBACK );
	} );
} );
