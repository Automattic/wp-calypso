// Test resources
import {
	FEATURE_SOCIAL_SHARES_1000,
	WPCOM_FEATURES_AKISMET,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_INSTANT_SEARCH,
	WPCOM_FEATURES_SCAN,
	WPCOM_FEATURES_VIDEOPRESS,
} from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import isBackupPluginActive from 'calypso/state/sites/selectors/is-backup-plugin-active';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import isSearchPluginActive from 'calypso/state/sites/selectors/is-search-plugin-active';
// Mocks
jest.mock( 'calypso/state/selectors/is-site-wpcom-atomic' );
jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'calypso/state/sites/selectors/get-site-slug' );
jest.mock( 'calypso/state/sites/selectors/is-backup-plugin-active' );
jest.mock( 'calypso/state/sites/selectors/is-jetpack-site' );
jest.mock( 'calypso/state/sites/selectors/is-jetpack-site-multi-site' );
jest.mock( 'calypso/state/sites/selectors/is-search-plugin-active' );
// Functions under test
import { getLandingPath, isSiteEligibleForJetpackCloud } from '../selectors';

const FAKE_SITE_SLUG = 'mysite.example';

const mockSiteFeatures =
	( ...featuresToMock ) =>
	( state, siteId, featureToTest ) =>
		featuresToMock.includes( featureToTest );

describe( 'getLandingPath', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it.each( [ [ undefined ], [ null ], [ Infinity ], [ 4.2 ], [ true ], [ 'abc' ] ] )(
		'should return /landing if an integer site ID is not specified',
		( siteId ) => {
			isJetpackSite.mockReturnValue( true );
			getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );

			const landingPath = getLandingPath( {}, siteId );
			expect( landingPath ).toEqual( '/landing' );
		}
	);

	it( 'should return /landing for ineligible sites', () => {
		isJetpackSite.mockReturnValue( false );

		const landingPath = getLandingPath( {}, 0 );
		expect( landingPath ).toEqual( '/landing' );
	} );

	it( 'should return /backup/<site> for eligible sites with Backup', () => {
		isJetpackSite.mockReturnValue( true );
		getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
		siteHasFeature.mockImplementation( mockSiteFeatures( WPCOM_FEATURES_BACKUPS ) );

		const landingPath = getLandingPath( {}, 0 );
		expect( landingPath ).toEqual( `/backup/${ FAKE_SITE_SLUG }` );
	} );

	it.each( [
		[ WPCOM_FEATURES_SCAN ],
		[ WPCOM_FEATURES_INSTANT_SEARCH ],
		[ FEATURE_SOCIAL_SHARES_1000 ],
		[ WPCOM_FEATURES_SCAN, WPCOM_FEATURES_INSTANT_SEARCH, FEATURE_SOCIAL_SHARES_1000 ],
	] )(
		'should return /backup/<site> for eligible sites with Backup and other features',
		( otherFeatures ) => {
			isJetpackSite.mockReturnValue( true );
			getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
			siteHasFeature.mockImplementation(
				mockSiteFeatures( WPCOM_FEATURES_BACKUPS, ...otherFeatures )
			);

			const landingPath = getLandingPath( {}, 0 );
			expect( landingPath ).toEqual( `/backup/${ FAKE_SITE_SLUG }` );
		}
	);

	it( 'should return /scan/<site> for sites with Scan but not Backup', () => {
		isJetpackSite.mockReturnValue( true );
		getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
		siteHasFeature.mockImplementation( mockSiteFeatures( WPCOM_FEATURES_SCAN ) );

		const landingPath = getLandingPath( {}, 0 );
		expect( landingPath ).toEqual( `/scan/${ FAKE_SITE_SLUG }` );
	} );

	it.each( [
		[ WPCOM_FEATURES_INSTANT_SEARCH ],
		[ FEATURE_SOCIAL_SHARES_1000 ],
		[ WPCOM_FEATURES_INSTANT_SEARCH, FEATURE_SOCIAL_SHARES_1000 ],
	] )(
		'should return /scan/<site> for eligible sites with Scan and other non-Backup features',
		( otherFeatures ) => {
			isJetpackSite.mockReturnValue( true );
			getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
			siteHasFeature.mockImplementation(
				mockSiteFeatures( WPCOM_FEATURES_SCAN, ...otherFeatures )
			);

			const landingPath = getLandingPath( {}, 0 );
			expect( landingPath ).toEqual( `/scan/${ FAKE_SITE_SLUG }` );
		}
	);

	it( 'should return /jetpack-search/<site> for sites with Search but not Scan or Backup', () => {
		isJetpackSite.mockReturnValue( true );
		getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
		siteHasFeature.mockImplementation( mockSiteFeatures( WPCOM_FEATURES_INSTANT_SEARCH ) );

		const landingPath = getLandingPath( {}, 0 );
		expect( landingPath ).toEqual( `/jetpack-search/${ FAKE_SITE_SLUG }` );
	} );

	it( 'should return /jetpack-search/<site> for sites with Search and Social', () => {
		isJetpackSite.mockReturnValue( true );
		getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
		siteHasFeature.mockImplementation(
			mockSiteFeatures( WPCOM_FEATURES_INSTANT_SEARCH, FEATURE_SOCIAL_SHARES_1000 )
		);

		const landingPath = getLandingPath( {}, 0 );
		expect( landingPath ).toEqual( `/jetpack-search/${ FAKE_SITE_SLUG }` );
	} );

	it( 'should return /jetpack-social/<site> for sites with Social but not Backup, Scan, or Search', () => {
		isJetpackSite.mockReturnValue( true );
		getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
		siteHasFeature.mockImplementation( mockSiteFeatures( FEATURE_SOCIAL_SHARES_1000 ) );

		const landingPath = getLandingPath( {}, 0 );
		expect( landingPath ).toEqual( `/jetpack-social/${ FAKE_SITE_SLUG }` );
	} );

	it.each( [ [ WPCOM_FEATURES_AKISMET ], [ WPCOM_FEATURES_VIDEOPRESS ] ] )(
		'should return /backup/<site> for sites with any other feature set',
		( featureSet ) => {
			isJetpackSite.mockReturnValue( true );
			getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
			siteHasFeature.mockImplementation( mockSiteFeatures( ...featureSet ) );

			const landingPath = getLandingPath( {}, 0 );
			expect( landingPath ).toEqual( `/backup/${ FAKE_SITE_SLUG }` );
		}
	);

	it( 'should return /backup/<site> when site features are unavailable', () => {
		isJetpackSite.mockReturnValue( true );
		getSiteSlug.mockReturnValue( FAKE_SITE_SLUG );
		siteHasFeature.mockReturnValue( false );

		const landingPath = getLandingPath( {}, 0 );
		expect( landingPath ).toEqual( `/backup/${ FAKE_SITE_SLUG }` );
	} );
} );

describe( 'isSiteEligibleForJetpackCloud', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should return false for multisites', () => {
		isJetpackSite.mockReturnValue( true );
		isJetpackSiteMultiSite.mockReturnValue( true );

		expect( isSiteEligibleForJetpackCloud( {}, 0 ) ).toEqual( false );
	} );

	it( 'should return true for single non-Atomic sites with an active combined Jetpack plugin', () => {
		isJetpackSite.mockReturnValue( true );

		expect( isSiteEligibleForJetpackCloud( {}, 0 ) ).toEqual( true );
	} );

	it( 'should return true for single non-Atomic sites with an active Backup plugin', () => {
		isBackupPluginActive.mockReturnValue( true );

		expect( isSiteEligibleForJetpackCloud( {}, 0 ) ).toEqual( true );
	} );

	it( 'should return true for single non-Atomic sites with an active Jetpack Search plugin', () => {
		isSearchPluginActive.mockReturnValue( true );

		expect( isSiteEligibleForJetpackCloud( {}, 0 ) ).toEqual( true );
	} );
} );
