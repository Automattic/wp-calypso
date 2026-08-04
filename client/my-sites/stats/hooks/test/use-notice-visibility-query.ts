import { normalizeNoticesVisibility } from '../use-notice-visibility-query';

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
