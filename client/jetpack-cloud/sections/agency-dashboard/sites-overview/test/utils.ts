/**
 * @jest-environment jsdom
 */

import { translate } from 'i18n-calypso';
import { site } from '../test/test-utils/constants';
import * as utils from '../utils';
import type { SiteData, Site } from '../types';

describe( 'utils', () => {
	describe( '#getActionEventName()', () => {
		test( 'should return the event name for a particular action', () => {
			const { getActionEventName } = utils;

			let isLargeScreen = true;
			expect( getActionEventName( 'issue_license', isLargeScreen ) ).toEqual(
				'calypso_jetpack_agency_dashboard_issue_license_large_screen'
			);

			isLargeScreen = false;
			expect( getActionEventName( 'visit_wp_admin', isLargeScreen ) ).toEqual(
				'calypso_jetpack_agency_dashboard_visit_wp_admin_small_screen'
			);
		} );
	} );

	describe( '#getRowMetaData()', () => {
		const scanThreats = 4;
		const pluginUpdates = [ 'plugin-1', 'plugin-2', 'plugin-3' ];
		const siteObj: Site = site;
		const rows: SiteData = {
			site: {
				value: siteObj,
				error: false,
				type: 'site',
				status: 'active',
			},
			backup: {
				type: 'backup',
				value: translate( 'Failed' ),
				status: 'failed',
			},
			monitor: {
				error: false,
				status: 'failed',
				type: 'monitor',
				value: translate( 'Site Down' ),
			},
			scan: {
				threats: 4,
				type: 'scan',
				status: 'failed',
				value: translate( '%(threats)d Threat', '%(threats)d Threats', {
					count: scanThreats,
					args: {
						threats: scanThreats,
					},
				} ),
			},
			plugin: {
				updates: pluginUpdates.length,
				type: 'plugin',
				value: `${ pluginUpdates.length } ${ translate( 'Available' ) }`,
				status: 'warning',
			},
			stats: {
				status: 'active',
				type: 'stats',
				value: siteObj.site_stats,
			},
			boost: {
				status: 'active',
				type: 'boost',
				value: siteObj.jetpack_boost_scores,
			},
		};
		test( 'should return the meta data for the feature type', () => {
			const { getRowMetaData } = utils;
			let isLargeScreen = true;
			expect( getRowMetaData( rows, 'site', isLargeScreen ).row.value.url ).toEqual( site.url );

			const expectedBackupValue = {
				eventName: 'calypso_jetpack_agency_dashboard_backup_failed_click_large_screen',
				isExternalLink: false,
				link: `/backup/${ site.url }`,
				row: rows.backup,
				siteDown: false,
				siteError: false,
				tooltip: 'Latest backup failed',
				tooltipId: `${ site.blog_id }-backup`,
			};
			expect( getRowMetaData( rows, 'backup', isLargeScreen ) ).toEqual( expectedBackupValue );

			const expectedScanValue = {
				eventName: 'calypso_jetpack_agency_dashboard_scan_threats_click_large_screen',
				isExternalLink: false,
				link: `/scan/${ site.url }`,
				row: rows.scan,
				siteDown: false,
				siteError: false,
				tooltip: 'Potential threats found',
				tooltipId: `${ site.blog_id }-scan`,
			};
			expect( getRowMetaData( rows, 'scan', isLargeScreen ) ).toEqual( expectedScanValue );

			isLargeScreen = false;
			const expectedMonitorValue = {
				eventName: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_small_screen',
				isExternalLink: true,
				link: `https://jptools.wordpress.com/debug/?url=${ site.url }`,
				row: rows.monitor,
				siteDown: false,
				siteError: false,
				tooltip: 'Site appears to be offline',
				tooltipId: `${ site.blog_id }-monitor`,
			};
			expect( getRowMetaData( rows, 'monitor', isLargeScreen ) ).toEqual( expectedMonitorValue );

			const expectedPluginValue = {
				eventName: 'calypso_jetpack_agency_dashboard_update_plugins_click_small_screen',
				isExternalLink: true,
				link: `https://wordpress.com/plugins/updates/${ site.url }`,
				row: rows.plugin,
				siteDown: false,
				siteError: false,
				tooltip: 'Plugin updates are available',
				tooltipId: `${ site.blog_id }-plugin`,
			};
			expect( getRowMetaData( rows, 'plugin', isLargeScreen ) ).toEqual( expectedPluginValue );

			const expectedStatsValue = {
				eventName: undefined,
				isExternalLink: false,
				link: '',
				row: rows.stats,
				siteDown: false,
				siteError: false,
				tooltip: undefined,
				tooltipId: `${ site.blog_id }-stats`,
			};
			expect( getRowMetaData( rows, 'stats', isLargeScreen ) ).toEqual( expectedStatsValue );

			const expectedBoostValue = {
				eventName: undefined,
				isExternalLink: false,
				link: '',
				row: rows.boost,
				siteDown: false,
				siteError: false,
				tooltip: undefined,
				tooltipId: `${ site.blog_id }-boost`,
			};
			expect( getRowMetaData( rows, 'boost', isLargeScreen ) ).toEqual( expectedBoostValue );
		} );
	} );

	describe( '#formatSites()', () => {
		let sites: any = [];

		test( 'should return any empty array', () => {
			const { formatSites } = utils;
			expect( formatSites( sites ) ).toEqual( [] );
		} );

		test( 'should return an array of formatted sites', () => {
			const { formatSites } = utils;
			sites = [
				{
					awaiting_plugin_updates: [ 'plugin-1' ],
					is_connection_healthy: false,
					has_backup: true,
					latest_backup_status: 'rewind_backup_complete',
					has_scan: true,
					latest_scan_threats_found: [ 'threat-1', 'threat-2' ],
					monitor_active: true,
					monitor_site_status: true,
					monitor_settings: {
						monitor_active: true,
						monitor_site_status: true,
					},
					site_stats: {
						views: {
							total: 0,
							trend: 'up',
							trend_change: 0,
						},
						visitors: {
							total: 0,
							trend: 'up',
							trend_change: 0,
						},
					},
					jetpack_boost_scores: {
						overall: 100,
						mobile: 50,
						desktop: 50,
					},
				},
			];
			expect( formatSites( sites ) ).toEqual( [
				{
					site: {
						error: true,
						status: 'active',
						type: 'site',
						value: sites[ 0 ],
					},
					stats: {
						status: 'active',
						type: 'stats',
						value: sites[ 0 ].site_stats,
					},
					boost: {
						status: 'active',
						type: 'boost',
						value: sites[ 0 ].jetpack_boost_scores,
					},
					backup: {
						status: 'success',
						type: 'backup',
						value: '',
					},
					scan: {
						status: 'failed',
						threats: 2,
						type: 'scan',
						value: '2 Threats',
					},
					monitor: {
						error: false,
						status: 'success',
						type: 'monitor',
						value: '',
						settings: {
							monitor_active: true,
							monitor_site_status: true,
						},
					},
					plugin: {
						status: 'warning',
						type: 'plugin',
						updates: 1,
						value: '1 Available',
					},
				},
			] );
		} );
	} );

	describe( 'getSiteCountText', () => {
		const { getSiteCountText } = utils;
		it( 'should return null when given an empty array of sites', () => {
			const sites: Site[] = [];
			const result = getSiteCountText( sites );
			expect( result ).toBeNull();
		} );

		it( 'should return the URL of a single site', () => {
			const sites: Site[] = [ site ];
			const result = getSiteCountText( sites );
			expect( result ).toEqual( site.url );
		} );

		it( 'should return the correct text for multiple sites', () => {
			const sites: Site[] = [
				{ ...site, blog_id: 1 },
				{ ...site, blog_id: 2 },
			];
			const result = getSiteCountText( sites );
			expect( result ).toEqual( '2 sites' );
		} );
	} );

	describe( 'getBoostRating', () => {
		const { getBoostRating, BOOST_THRESHOLDS: thresholds } = utils;

		it( 'should return the correct rating for a high boost score', () => {
			const boostScore = 95;
			const expectedRating = 'A';
			const result = getBoostRating( boostScore );
			expect( result ).toEqual( expectedRating );
		} );

		it( 'should return the correct rating for a moderate boost score', () => {
			const boostScore = 60;
			const expectedRating = 'C';
			const result = getBoostRating( boostScore );
			expect( result ).toEqual( expectedRating );
		} );

		it( 'should return the correct rating for a low boost score', () => {
			const boostScore = 10;
			const expectedRating = 'F';
			const result = getBoostRating( boostScore );
			expect( result ).toEqual( expectedRating );
		} );

		it( 'should return the correct rating for each threshold value', () => {
			thresholds.forEach( ( { threshold, rating } ) => {
				const result = getBoostRating( threshold + 1 );
				expect( result ).toEqual( rating );
			} );
		} );
	} );

	describe( 'getBoostRatingClass', () => {
		const { getBoostRatingClass } = utils;
		it( 'should return "boost-score-good" for a high boost score', () => {
			const boostScore = 80;
			const expectedClass = 'boost-score-good';
			const result = getBoostRatingClass( boostScore );
			expect( result ).toEqual( expectedClass );
		} );

		it( 'should return "boost-score-okay" for a moderate boost score', () => {
			const boostScore = 40;
			const expectedClass = 'boost-score-okay';
			const result = getBoostRatingClass( boostScore );
			expect( result ).toEqual( expectedClass );
		} );

		it( 'should return "boost-score-bad" for a low boost score', () => {
			const boostScore = 10;
			const expectedClass = 'boost-score-bad';
			const result = getBoostRatingClass( boostScore );
			expect( result ).toEqual( expectedClass );
		} );
	} );

	describe( 'extractBackupTextValues', () => {
		const { extractBackupTextValues } = utils;

		it( 'should extract values for multiple keys from a string', () => {
			const str = '1 theme, 2 posts and 5 pages';
			const expectedValues = { post: 2, page: 5, theme: 1 };
			const result = extractBackupTextValues( str );
			expect( result ).toEqual( expectedValues );
		} );

		it( 'should handle singular and plural forms correctly', () => {
			const str = '1 post and 3 pages';
			const expectedValues = { post: 1, page: 3 };
			const result = extractBackupTextValues( str );
			expect( result ).toEqual( expectedValues );
		} );

		it( 'should return an empty object for a string without values', () => {
			const str = '';
			const expectedValues = {};
			const result = extractBackupTextValues( str );
			expect( result ).toEqual( expectedValues );
		} );
	} );

	describe( 'getExtractedBackupTitle', () => {
		const { getExtractedBackupTitle } = utils;

		let backup: { activityTitle: string; activityDescription: any };

		beforeEach( () => {
			// Reset backup before each test
			backup = {
				activityTitle: 'Backup title',
				activityDescription: [ { children: [ { text: '' } ] } ],
			};
		} );

		it( 'should return the backup title when backupText is empty', () => {
			backup.activityTitle = 'Backup title';
			const expectedTitle = 'Backup title';
			const result = getExtractedBackupTitle( backup );
			expect( result ).toEqual( expectedTitle );
		} );

		it( 'should extract and format post and page counts from backupText', () => {
			backup.activityDescription = [ { children: [ { text: '3 posts and 1 page' } ] } ];
			const expectedTitle = '3 posts, 1 page';
			const result = getExtractedBackupTitle( backup );
			expect( result ).toEqual( expectedTitle );
		} );

		it( 'should handle missing post and page counts', () => {
			backup.activityDescription = [ { children: [ { text: '3 pages' } ] } ];
			let result = getExtractedBackupTitle( backup );
			expect( result ).toEqual( '3 pages' );

			backup.activityDescription = [ { children: [ { text: '5 posts' } ] } ];
			result = getExtractedBackupTitle( backup );
			expect( result ).toEqual( '5 posts' );
		} );
	} );

	describe( 'getMonitorDowntimeText', () => {
		const { getMonitorDowntimeText } = utils;
		it( 'should return "Downtime" when given undefined downtime', () => {
			const downtime = undefined;
			const expectedText = 'Downtime';
			const result = getMonitorDowntimeText( downtime );
			expect( result ).toEqual( expectedText );
		} );

		it( 'should return the correct text for a high downtime value for 1 day', () => {
			const downtime = 1440;
			const expectedText = 'Downtime for 1d';
			const result = getMonitorDowntimeText( downtime );
			expect( result ).toEqual( expectedText );
		} );

		it( 'should return the correct text for a moderate downtime value only in hours', () => {
			const downtime = 120;
			const expectedText = 'Downtime for 2h';
			const result = getMonitorDowntimeText( downtime );
			expect( result ).toEqual( expectedText );
		} );

		it( 'should return the correct text for a moderate downtime value in hours and min', () => {
			const downtime = 150;
			const expectedText = 'Downtime for 2h 30m';
			const result = getMonitorDowntimeText( downtime );
			expect( result ).toEqual( expectedText );
		} );

		it( 'should return the correct text for a low downtime value', () => {
			const downtime = 20;
			const expectedText = 'Downtime for 20m';
			const result = getMonitorDowntimeText( downtime );
			expect( result ).toEqual( expectedText );
		} );
	} );
} );
