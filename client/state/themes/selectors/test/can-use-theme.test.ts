import { WPCOM_FEATURES_ATOMIC, WPCOM_FEATURES_SENSEI_THEMES } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import * as themeSelectors from 'calypso/state/themes/selectors';
import { canUseTheme } from '../can-use-theme';

jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'calypso/state/themes/selectors' );

const mockedSiteHasFeature = jest.mocked( siteHasFeature );
const mockedThemeSelectors = jest.mocked( themeSelectors );

describe( 'canUseTheme', () => {
	describe( 'sensei', () => {
		const state = {};
		const siteId = 1;
		const themeTier = {
			slug: 'sensei',
			feature: 'sensei-themes',
			platform: 'atomic',
		};

		it( 'returns true if the site has Sensei and Atomic features', () => {
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
} );
