import { useSelector } from 'calypso/state';
import { getThemeTierForTheme } from 'calypso/state/themes/selectors';

export function useThemeTierForTheme( themeId: string ) {
	return useSelector( ( state ) => getThemeTierForTheme( state, themeId ) );

	/* @SEE https://github.com/Automattic/dotcom-forge/issues/8028
	const siteId = useSelector( getSelectedSiteId );
	const retainedBenefits = useTierRetainedBenefitsQuery( siteId as number, themeId );

	return retainedBenefits?.is_eligible && retainedBenefits?.tier
		? retainedBenefits?.tier
		: themeTier;
	 */
}
