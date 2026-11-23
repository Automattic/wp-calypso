/**
 * @jest-environment jsdom
 */
import { getBackLinkFromURL } from '../main';

const backLinkFor = ( from ) => {
	window.history.replaceState( null, '', `/plugins/manage?from=${ encodeURIComponent( from ) }` );
	return getBackLinkFromURL();
};

describe( 'getBackLinkFromURL', () => {
	it( 'keeps a link on this site', () => {
		expect( backLinkFor( '/sites?x=1#y' ) ).toBe( `${ window.location.origin }/sites?x=1#y` );
		expect( backLinkFor( '/.//evil.example' ) ).toBe( `${ window.location.origin }//evil.example` );
	} );

	it.each( [ '//evil.example', '/\\evil.example', '/\t/evil.example', '//[oops' ] )(
		'drops %j, which leaves this site or cannot be parsed',
		( from ) => {
			expect( backLinkFor( from ) ).toBe( '' );
		}
	);
} );
