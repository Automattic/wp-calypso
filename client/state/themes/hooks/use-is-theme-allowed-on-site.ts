import { useTierRetainedBenefitsQuery } from 'calypso/data/themes/use-tier-retained-benefits-query';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isThemeAllowedOnSite } from 'calypso/state/themes/selectors';

export function useIsThemeAllowedOnSite( siteId: number, themeId: string ) {
	const isThemeAllowed = useSelector( ( state ) => isThemeAllowedOnSite( state, siteId, themeId ) );

	const retainedBenefits = useTierRetainedBenefitsQuery( siteId, themeId );
	const hasFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, retainedBenefits?.tier.feature ?? '' )
	);

	if ( isThemeAllowed ) {
		return true;
	}

	if ( ! retainedBenefits?.is_eligible ) {
		return false;
	}

	if ( retainedBenefits.tier.feature === null ) {
		return true;
	}

	return hasFeature;
}
