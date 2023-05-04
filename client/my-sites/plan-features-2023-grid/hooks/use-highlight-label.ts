import { isBusinessPlan, isPersonalPlan, planLevelsMatch } from '@automattic/calypso-products';
import { isNewsletterFlow } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isPopularPlan } from '../lib/is-popular-plan';

const useHighlightLabel = ( planName: string, flowName: string | null, selectedPlan?: string ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, selectedSiteId ) );
	const isAvailableForPurchase = useSelector(
		( state ) => !! selectedSiteId && isPlanAvailableForPurchase( state, selectedSiteId, planName )
	);
	const isCurrentPlan = currentPlan?.productSlug === planName;
	const isSuggestedPlan =
		selectedPlan && planLevelsMatch( planName, selectedPlan ) && isAvailableForPurchase;

	if ( isNewsletterFlow( flowName ) ) {
		if ( isPersonalPlan( planName ) ) {
			return translate( 'Best for Newsletter' );
		}
	} else if ( isCurrentPlan ) {
		return translate( 'Your plan' );
	} else if ( isSuggestedPlan ) {
		return translate( 'Suggested' );
	} else if ( isBusinessPlan( planName ) ) {
		return translate( 'Best for devs' );
	} else if ( isPopularPlan( planName ) ) {
		return translate( 'Popular' );
	}

	return null;
};

export default useHighlightLabel;
