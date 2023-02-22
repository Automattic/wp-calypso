import { isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';

const useHighlightLabel = ( planName: string ) => {
	const translate = useTranslate();

	if ( isBusinessPlan( planName ) ) {
		return translate( 'Best for devs' );
	} else if ( isPremiumPlan( planName ) ) {
		return translate( 'Popular' );
	}

	return null;
};

export default useHighlightLabel;
