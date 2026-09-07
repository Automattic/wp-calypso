import { getHelpCenterSiteContext } from '../help-center-site-context';

describe( 'getHelpCenterSiteContext', () => {
	it( 'uses valid Help Center site ID before primary site ID', () => {
		expect( getHelpCenterSiteContext( '123', 456 ) ).toEqual( {
			blogId: 123,
			siteContextSource: 'help_center_context',
		} );
	} );

	it( 'uses primary site ID when Help Center site ID is invalid', () => {
		expect( getHelpCenterSiteContext( 0, 456 ) ).toEqual( {
			blogId: 456,
			siteContextSource: 'primary_site',
		} );
	} );

	it( 'keeps primary site source when no valid site ID exists', () => {
		expect( getHelpCenterSiteContext( null, 0 ) ).toEqual( {
			blogId: undefined,
			siteContextSource: 'primary_site',
		} );
	} );
} );
