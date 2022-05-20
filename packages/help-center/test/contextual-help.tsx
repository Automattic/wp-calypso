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

jest.setTimeout( 2000 );

async function linkStatus( link: string ) {
	const response = await fetch( link, { redirect: 'manual' } );
	return {
		status: response.status,
		location: response.headers.get( 'location' ) || link,
	};
}

describe( 'All defaultFallbackLinks links should have status 200', () => {
	for ( const item of defaultFallbackLinks ) {
		it( `${ item.link } should not redirect`, async () => {
			const result = await linkStatus( item.link );
			expect( result ).toEqual( {
				location: item.link,
				status: 200,
			} );
		} );
	}
} );

describe( 'All bloggerFallbackLinks links should have status 200', () => {
	for ( const item of bloggerFallbackLinks ) {
		it( `${ item.link } should not redirect`, async () => {
			const result = await linkStatus( item.link );
			expect( result ).toEqual( {
				location: item.link,
				status: 200,
			} );
		} );
	}
} );

describe( 'All videosForSection links should have status 200', () => {
	const sections = Object.values( videosForSection );
	for ( const item of sections ) {
		for ( const subItem of item ) {
			it( `${ subItem.link } should not redirect`, async () => {
				const result = await linkStatus( subItem.link );
				expect( result ).toEqual( {
					location: subItem.link,
					status: 200,
				} );
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
					const result = await linkStatus( subItem.link );
					expect( result ).toEqual( {
						location: subItem.link,
						status: 200,
					} );
				} );
			}
		} else {
			it( `${ item.link } should not redirect`, async () => {
				const result = await linkStatus( item.link );
				expect( result ).toEqual( {
					location: item.link,
					status: 200,
				} );
			} );
		}
	}
} );
