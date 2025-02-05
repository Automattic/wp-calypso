import { useSelector } from 'calypso/state';
import { isThemeAllowedOnSite } from 'calypso/state/themes/selectors/is-theme-allowed-on-site';

export function useIsThemeAllowedOnSite( siteId: number | null, themeId: string ) {
	return useSelector( ( state ) => isThemeAllowedOnSite( state, siteId, themeId ) );

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
