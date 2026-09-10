import { QueryClient } from '@tanstack/react-query';
import {
	normalizeNoticeRecords,
	normalizeNoticesVisibility,
	noticesVisibilityQueryKey,
	setNoticeHidden,
	toNoticeRecord,
	toNoticesVisibility,
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

describe( 'normalizeNoticeRecords', () => {
	const detail = {
		show: false,
		status: 'postponed',
		postponed_count: 1,
		next_show_at: 1_800_000_000,
	};

	it( 'reads a detail record as the server sent it', () => {
		expect(
			normalizeNoticeRecords( { premium_analytics_preview: detail } ).premium_analytics_preview
		).toEqual( detail );
	} );

	/**
	 * An older server, or a Jetpack plugin without the details route, still answers with a flat
	 * `{ id: bool }` map. It must land in the same shape, reading as never postponed, so the
	 * banner keeps its single 30-day hold there instead of throwing.
	 */
	it( 'wraps a bare boolean as a record that was never postponed', () => {
		const records = normalizeNoticeRecords( {
			premium_analytics_preview: true,
			tier_upgrade: false,
		} );

		expect( records.premium_analytics_preview ).toEqual( {
			show: true,
			status: null,
			postponed_count: 0,
			next_show_at: null,
		} );
		expect( records.tier_upgrade.show ).toBe( false );
	} );

	it( 'fills ids missing from the response with their defaults', () => {
		const records = normalizeNoticeRecords( {} );

		expect( records.tier_upgrade ).toEqual( {
			show: true,
			status: null,
			postponed_count: 0,
			next_show_at: null,
		} );
		expect( records.premium_analytics_preview.show ).toBe( false );
		expect( normalizeNoticeRecords( null ) ).toEqual( records );
	} );

	it( 'keeps the legacy upsell inheritance for free_site_upgrade on detail records', () => {
		const records = normalizeNoticeRecords( {
			free_site_upgrade: { ...detail, show: true, postponed_count: 0 },
			do_you_love_jetpack_stats: { ...detail, show: false },
		} );

		expect( records.free_site_upgrade.show ).toBe( false );
	} );

	it( 'discards malformed escalation fields rather than passing them on', () => {
		const record = toNoticeRecord( {
			show: 1,
			status: 'expired',
			postponed_count: 'two',
			next_show_at: 'soon',
		} );

		expect( record ).toEqual( {
			show: true,
			status: null,
			postponed_count: 0,
			next_show_at: null,
		} );
	} );

	it( 'reduces records to the flat map the rest of Stats reads', () => {
		const visibility = toNoticesVisibility(
			normalizeNoticeRecords( { premium_analytics_preview: detail, tier_upgrade: true } )
		);

		expect( visibility.premium_analytics_preview ).toBe( false );
		expect( visibility.tier_upgrade ).toBe( true );
		expect( visibility.gdpr_cookie_consent ).toBe( false );
	} );
} );

describe( 'setNoticeHidden', () => {
	const read = ( client: QueryClient ) =>
		client.getQueryData< ReturnType< typeof normalizeNoticeRecords > >(
			noticesVisibilityQueryKey( 1 )
		);

	it( 'hides the notice from the record it already holds when no record is given', () => {
		const client = new QueryClient();
		client.setQueryData(
			noticesVisibilityQueryKey( 1 ),
			normalizeNoticeRecords( {
				pricing_grid: { show: true, status: null, postponed_count: 2, next_show_at: null },
				tier_upgrade: true,
			} )
		);

		setNoticeHidden( client, 1, 'pricing_grid' );

		expect( read( client )?.pricing_grid ).toEqual( {
			show: false,
			status: null,
			postponed_count: 2,
			next_show_at: null,
		} );
		expect( read( client )?.tier_upgrade.show ).toBe( true );
	} );

	it.each( [ 'do_you_love_jetpack_stats', 'commercial_site_upgrade' ] as const )(
		'hides the successor when %s is hidden, preserving its metadata',
		( noticeId ) => {
			const client = new QueryClient();
			const records = normalizeNoticeRecords( {
				[ noticeId ]: true,
				free_site_upgrade: {
					show: true,
					status: 'postponed',
					postponed_count: 2,
					next_show_at: 1_700_000_000,
				},
				tier_upgrade: true,
			} );
			client.setQueryData( noticesVisibilityQueryKey( 1 ), records );

			expect( records.free_site_upgrade.show ).toBe( true );

			setNoticeHidden( client, 1, noticeId, {
				status: 'postponed',
				postponed_count: 1,
				next_show_at: 1_800_000_000,
			} );

			expect( read( client )?.[ noticeId ].show ).toBe( false );
			expect( read( client )?.free_site_upgrade ).toEqual( {
				...records.free_site_upgrade,
				show: false,
			} );
			expect( read( client )?.tier_upgrade ).toBe( records.tier_upgrade );
		}
	);

	it( 'leaves a cache that was never fetched empty', () => {
		const client = new QueryClient();

		setNoticeHidden( client, 1, 'pricing_grid' );

		expect( read( client ) ).toBeUndefined();
	} );
} );
