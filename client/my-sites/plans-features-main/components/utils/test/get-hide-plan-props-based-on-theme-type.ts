import {
	BUNDLED_THEME,
	DOT_ORG_THEME,
	MARKETPLACE_THEME,
	PERSONAL_THEME,
	PREMIUM_THEME,
} from '@automattic/design-picker';
import { getHidePlanPropsBasedOnThemeType } from '../utils';

describe( 'getHidePlanPropsBasedOnThemeType', () => {
	it( 'shows Personal and higher for marketplace themes', () => {
		expect( getHidePlanPropsBasedOnThemeType( MARKETPLACE_THEME ) ).toEqual( {
			hideFreePlan: true,
		} );
	} );

	it.each( [ DOT_ORG_THEME, BUNDLED_THEME ] )(
		'shows Business and higher for %s themes',
		( type ) => {
			expect( getHidePlanPropsBasedOnThemeType( type ) ).toEqual( {
				hidePremiumPlan: true,
				hidePersonalPlan: true,
				hideFreePlan: true,
			} );
		}
	);

	it.each( [ PERSONAL_THEME, PREMIUM_THEME ] )(
		'shows Personal and higher for %s themes',
		( type ) => {
			expect( getHidePlanPropsBasedOnThemeType( type ) ).toEqual( { hideFreePlan: true } );
		}
	);
} );
