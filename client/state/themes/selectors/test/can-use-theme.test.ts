import {
	FEATURE_INSTALL_THEMES,
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_COMMUNITY_THEMES,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_SENSEI_THEMES,
} from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import * as themeSelectors from 'calypso/state/themes/selectors';
import { canUseTheme } from '../can-use-theme';

jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'calypso/state/themes/selectors' );

const mockedSiteHasFeature = jest.mocked( siteHasFeature );
const mockedThemeSelectors = jest.mocked( themeSelectors );

describe( 'canUseTheme', () => {
	const state = {};
	const siteId = 1;

	describe( 'free', () => {
		const themeTier = {
			slug: 'free',
			feature: null,
			platform: 'simple',
		};

		it( 'returns true', () => {
			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'strand' ) ).toBe( true );
		} );
	} );

	describe( 'personal', () => {
		const themeTier = {
			slug: 'personal',
			feature: 'personal-themes',
			platform: 'simple',
		};

		it( 'returns true if the site has the Personal Themes feature', () => {
			mockedSiteHasFeature.mockImplementation( ( _state, _siteId, feature ) =>
				[ WPCOM_FEATURES_PREMIUM_THEMES_LIMITED ].includes( feature )
			);

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'crafted' ) ).toBe( true );
		} );

		it( 'returns false otherwise', () => {
			mockedSiteHasFeature.mockReturnValue( false );

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'crafted' ) ).toBe( false );
		} );
	} );

	describe( 'premium', () => {
		const themeTier = {
			slug: 'premium',
			feature: 'premium-themes',
			platform: 'simple',
		};

		it( 'returns true if the site has the Premium Themes feature', () => {
			mockedSiteHasFeature.mockImplementation( ( _state, _siteId, feature ) =>
				[ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ].includes( feature )
			);

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'launchit' ) ).toBe( true );
		} );

		it( 'returns false otherwise', () => {
			mockedSiteHasFeature.mockReturnValue( false );

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'launchit' ) ).toBe( false );
		} );
	} );

	describe( 'community', () => {
		const themeTier = {
			slug: 'community',
		};

		it( 'returns true if the site has the Install Themes and Community Themes features', () => {
			mockedSiteHasFeature.mockImplementation( ( _state, _siteId, feature ) =>
				[ FEATURE_INSTALL_THEMES, WPCOM_FEATURES_COMMUNITY_THEMES ].includes( feature )
			);

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'kadence' ) ).toBe( true );
		} );

		it( 'returns false otherwise', () => {
			mockedSiteHasFeature.mockReturnValue( false );

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'kadence' ) ).toBe( false );
		} );
	} );

	describe( 'sensei', () => {
		const themeTier = {
			slug: 'sensei',
			feature: 'sensei-themes',
			platform: 'atomic',
		};

		it( 'returns true if the site has the Sensei and Atomic features', () => {
			mockedSiteHasFeature.mockImplementation( ( _state, _siteId, feature ) =>
				[ WPCOM_FEATURES_SENSEI_THEMES, WPCOM_FEATURES_ATOMIC ].includes( feature )
			);

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'course' ) ).toBe( true );
		} );

		it( 'returns false otherwise', () => {
			mockedSiteHasFeature.mockReturnValue( false );

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'course' ) ).toBe( false );
		} );
	} );

	describe( 'woo', () => {
		const themeTier = {
			slug: 'woocommerce',
			platform: 'simple',
			feature: null,
			featureList: [ 'woocommerce-themes', 'ecommerce-managed-plugins' ],
		};

		it( 'returns true if the site has the Premium Themes and Atomic features, as well as any extra feature checks depending on the theme software set', () => {
			mockedSiteHasFeature.mockImplementation( ( _state, _siteId, feature ) =>
				[ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED, WPCOM_FEATURES_ATOMIC, FEATURE_WOOP ].includes(
					feature
				)
			);

			mockedThemeSelectors.getThemeSoftwareSet.mockReturnValue( [ 'woo-on-plans' ] );
			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'kiosko' ) ).toBe( true );
		} );

		it( 'returns false if the site has the Premium Themes and Atomic features, but not the extra feature checks depending on the theme software set', () => {
			mockedSiteHasFeature.mockImplementation( ( _state, _siteId, feature ) =>
				[ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED, WPCOM_FEATURES_ATOMIC ].includes( feature )
			);

			mockedThemeSelectors.getThemeSoftwareSet.mockReturnValue( [ 'woo-on-plans' ] );
			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'kiosko' ) ).toBe( false );
		} );

		it( 'returns false otherwise', () => {
			mockedSiteHasFeature.mockReturnValue( false );

			mockedThemeSelectors.getThemeSoftwareSet.mockReturnValue( [ 'woo-on-plans' ] );
			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'kiosko' ) ).toBe( false );
		} );
	} );

	describe( 'partner', () => {
		const themeTier = {
			slug: 'partner',
			feature: 'partner-themes',
			platform: 'atomic',
		};

		it( 'returns true if the site has the Atomic feature', () => {
			mockedSiteHasFeature.mockImplementation( ( _state, _siteId, feature ) =>
				[ WPCOM_FEATURES_ATOMIC ].includes( feature )
			);

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'organic-stax' ) ).toBe( true );
		} );

		it( 'returns false otherwise', () => {
			mockedSiteHasFeature.mockReturnValue( false );

			mockedThemeSelectors.getThemeTierForTheme.mockReturnValue( themeTier );

			expect( canUseTheme( state, siteId, 'organic-stax' ) ).toBe( false );
		} );
	} );
} );
