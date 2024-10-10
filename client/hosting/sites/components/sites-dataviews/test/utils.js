import { isDefaultSiteTitle } from 'calypso/hosting/sites/components/sites-dataviews/utils';

describe( 'isDefaultSiteTitle', () => {
	it.each( [ { title: 'Site Title' }, { title: 'My WordPress Site' } ] )(
		'returns true when the site title is the default',
		( { title } ) => {
			expect( isDefaultSiteTitle( title ) ).toBe( true );
		}
	);

	it( 'returns false when the site title is not a default title', () => {
		expect( isDefaultSiteTitle( 'foobar' ) ).toBe( false );
	} );
} );
