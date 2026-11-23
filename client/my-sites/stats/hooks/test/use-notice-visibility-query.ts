import { QueryClient } from '@tanstack/react-query';
import {
	Notices,
	normalizeNoticesVisibility,
	noticesVisibilityQueryKey,
	setNoticeHidden,
} from '../use-notice-visibility-query';

const serverSaysVisible = {
	free_site_upgrade: true,
	do_you_love_jetpack_stats: true,
	commercial_site_upgrade: true,
};

describe( 'normalizeNoticesVisibility', () => {
	it( 'keeps free_site_upgrade visible when neither legacy upsell was dismissed', () => {
		expect( normalizeNoticesVisibility( serverSaysVisible ).free_site_upgrade ).toBe( true );
	} );

	it( 'hides free_site_upgrade while either legacy upsell dismissal is in effect', () => {
		expect(
			normalizeNoticesVisibility( { ...serverSaysVisible, do_you_love_jetpack_stats: false } )
				.free_site_upgrade
		).toBe( false );
		expect(
			normalizeNoticesVisibility( { ...serverSaysVisible, commercial_site_upgrade: false } )
				.free_site_upgrade
		).toBe( false );
	} );

	it( 'treats legacy ids missing from the response as not dismissed', () => {
		expect( normalizeNoticesVisibility( { free_site_upgrade: true } ).free_site_upgrade ).toBe(
			true
		);
	} );

	it( 'degrades an empty response body to the defaults instead of throwing', () => {
		expect( normalizeNoticesVisibility( null ) ).toEqual( normalizeNoticesVisibility( {} ) );
		expect( normalizeNoticesVisibility( undefined ).free_site_upgrade ).toBe( false );
	} );

	it( 'keeps its own dismissal and the hidden-by-default fallback', () => {
		expect(
			normalizeNoticesVisibility( { ...serverSaysVisible, free_site_upgrade: false } )
				.free_site_upgrade
		).toBe( false );
		// A response predating the server allow-list change omits the id entirely.
		expect(
			normalizeNoticesVisibility( {
				do_you_love_jetpack_stats: true,
				commercial_site_upgrade: true,
			} ).free_site_upgrade
		).toBe( false );
	} );
} );

describe( 'setNoticeHidden', () => {
	const read = ( client: QueryClient ) =>
		client.getQueryData< Notices >( noticesVisibilityQueryKey( 1 ) );

	it( 'hides only that notice', () => {
		const client = new QueryClient();
		client.setQueryData(
			noticesVisibilityQueryKey( 1 ),
			normalizeNoticesVisibility( { pricing_grid: true, tier_upgrade: true } )
		);

		setNoticeHidden( client, 1, 'pricing_grid' );

		expect( read( client )?.pricing_grid ).toBe( false );
		expect( read( client )?.tier_upgrade ).toBe( true );
	} );

	it( 'leaves a cache that was never fetched empty', () => {
		const client = new QueryClient();

		setNoticeHidden( client, 1, 'pricing_grid' );

		expect( read( client ) ).toBeUndefined();
	} );
} );
