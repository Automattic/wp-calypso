import { isBusinessPlan, isPremiumPlan, isPersonalPlan } from '@automattic/calypso-products';
import { isLinkInBioFlow, isNewsletterFlow } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { isPopularPlan } from '../lib/is-popular-plan';

interface Props {
	planName: string;
	flowName?: string | null;
	currentSitePlanSlug?: string;
}

const useHighlightLabel = ( { planName, flowName, currentSitePlanSlug }: Props ) => {
	const translate = useTranslate();
	const isCurrentPlan = currentSitePlanSlug === planName;

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
	} else if ( isBusinessPlan( planName ) ) {
		return translate( 'Best for devs' );
	} else if ( isPopularPlan( planName ) ) {
		return translate( 'Popular' );
	}

	return null;
};

export default useHighlightLabel;
