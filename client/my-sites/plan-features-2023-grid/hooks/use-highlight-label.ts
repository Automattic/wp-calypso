import { isBusinessPlan, isPersonalPlan } from '@automattic/calypso-products';
import { isNewsletterFlow } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isPopularPlan } from '../lib/is-popular-plan';

const useHighlightLabel = ( planName: string, flowName: string | null ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, selectedSiteId ) );
	const isCurrentPlan = currentPlan?.productSlug === planName;

	if ( isNewsletterFlow( flowName ) ) {
		if ( isPersonalPlan( planName ) ) {
			return translate( 'Best for Newsletter' );
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
