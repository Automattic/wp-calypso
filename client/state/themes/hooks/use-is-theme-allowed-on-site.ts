import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getThemeTierForTheme } from 'calypso/state/themes/selectors';

export function useIsThemeAllowedOnSite( siteId: number | null, themeId: string ) {
	return useSelector( ( state ) => {
		const themeTier = getThemeTierForTheme( state, themeId );
		const features = themeTier?.featureList ?? [ themeTier?.feature ];

		return features.some(
			( feature: string | null | undefined ) =>
				! feature || siteHasFeature( state, siteId, feature )
		);
	} );

	/* @SEE https://github.com/Automattic/dotcom-forge/issues/8028
	const retainedBenefits = useTierRetainedBenefitsQuery( siteId, themeId );

	const hasFeature = useSelector( ( state ) => {
		const retainedFeatures = retainedBenefits?.tier?.featureList ?? [
			retainedBenefits?.tier?.feature,
		];

		return retainedFeatures.some(
			( feature: string | null | undefined ) =>
				! feature || siteHasFeature( state, siteId, feature )
		);
	} );

	if ( isThemeAllowed ) {
		return true;
	}

	if ( ! retainedBenefits?.is_eligible ) {
		return false;
	}

	if ( retainedBenefits?.tier?.feature === null ) {
		return true;
	}

	return hasFeature;
	 */
}
