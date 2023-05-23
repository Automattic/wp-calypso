import {
	isBusinessPlan,
	isPremiumPlan,
	isPersonalPlan,
	planLevelsMatch,
} from '@automattic/calypso-products';
import { isLinkInBioFlow, isNewsletterFlow } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isPopularPlan } from '../lib/is-popular-plan';

interface Props {
	planName: string;
	flowName?: string | null;
	currentSitePlanSlug?: string;
	selectedPlan?: string;
}

const useHighlightLabel = ( { planName, flowName, currentSitePlanSlug, selectedPlan }: Props ) => {
	const translate = useTranslate();
	const isCurrentPlan = currentSitePlanSlug === planName;
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isAvailableForPurchase = useSelector(
		( state ) => !! selectedSiteId && isPlanAvailableForPurchase( state, selectedSiteId, planName )
	);
	const isSuggestedPlan =
		selectedPlan && planLevelsMatch( planName, selectedPlan ) && isAvailableForPurchase;

	if ( flowName && isNewsletterFlow( flowName ) ) {
		if ( isPersonalPlan( planName ) ) {
			return translate( 'Best for Newsletter' );
		}
	} else if ( flowName && isLinkInBioFlow( flowName ) ) {
		if ( isPremiumPlan( planName ) ) {
			return translate( 'Best for Link in Bio' );
		}
	} else if ( isCurrentPlan ) {
		return translate( 'Your plan' );
	} else if ( isSuggestedPlan ) {
		return translate( 'Suggested' );
	} else if ( isBusinessPlan( planName ) && ! selectedPlan ) {
		return translate( 'Best for devs' );
	} else if ( isPopularPlan( planName ) && ! selectedPlan ) {
		return translate( 'Popular' );
	}

	return null;
};

export default useHighlightLabel;
