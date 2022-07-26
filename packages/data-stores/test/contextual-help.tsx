/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "expectNoRedirect"] }] */
import fetch from 'node-fetch';
import {
	defaultFallbackLinks,
	bloggerFallbackLinks,
	videosForSection,
	contextLinksForSection,
} from '../src/contextual-help/contextual-help';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
	__esModule: true,
	default: function config( key: string ) {
		return key;
	},
} ) );

async function linkStatus( link: string ) {
	const response = await fetch( link, { redirect: 'manual' } );
	return {
		status: response.status,
		location: response.headers.get( 'location' ) || link,
	};
}

async function expectNoRedirect( link: string ) {
	const result = await linkStatus( link );
	expect( result ).toEqual( {
		location: link,
		status: 200,
	} );
}

describe.skip( "disable tests because they're too flaly", () => {
	describe( 'All defaultFallbackLinks links should have status 200', () => {
		for ( const item of defaultFallbackLinks ) {
			it( `${ item.link } should not redirect`, async () => {
				await expectNoRedirect( item.link );
			} );
		}
	} );

	describe( 'All bloggerFallbackLinks links should have status 200', () => {
		for ( const item of bloggerFallbackLinks ) {
			it( `${ item.link } should not redirect`, async () => {
				await expectNoRedirect( item.link );
			} );
		}
	} );

	describe( 'All videosForSection links should have status 200', () => {
		const sections = Object.values( videosForSection );
		for ( const item of sections ) {
			for ( const subItem of item ) {
				it( `${ subItem.link } should not redirect`, async () => {
					await expectNoRedirect( subItem.link );
				} );
			}
		}
	} );

	describe( 'All contextLinksForSection links should have status 200', () => {
		const sections = Object.values( contextLinksForSection );
		for ( const item of sections ) {
			if ( Array.isArray( item ) ) {
				for ( const subItem of item ) {
					it( `${ subItem.link } should not redirect`, async () => {
						await expectNoRedirect( subItem.link );
					} );
				}
			} else {
				it( `${ item.link } should not redirect`, async () => {
					await expectNoRedirect( item.link );
				} );
			}
		}
	} );
} );
