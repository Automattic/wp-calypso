import { isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useHighlightLabel = ( planName: string ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, selectedSiteId ) );

	if ( isBusinessPlan( planName ) ) {
		return translate( 'Best for devs' );
	} else if ( isPremiumPlan( planName ) ) {
		return translate( 'Popular' );
	} else if ( currentPlan?.productSlug === planName ) {
		return translate( 'Your plan' );
	}

	return null;
};

export default useHighlightLabel;
