import { useTierRetainedBenefitsQuery } from 'calypso/data/themes/use-tier-retained-benefits-query';
import { useSelector } from 'calypso/state';
import { getThemeTierForTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useThemeTierForTheme( themeId: string ) {
	const themeTier = useSelector( ( state ) => getThemeTierForTheme( state, themeId ) );

	return themeTier;

	const siteId = useSelector( getSelectedSiteId );
	const retainedBenefits = useTierRetainedBenefitsQuery( siteId as number, themeId );

	return retainedBenefits?.is_eligible && retainedBenefits?.tier
		? retainedBenefits?.tier
		: themeTier;
}
