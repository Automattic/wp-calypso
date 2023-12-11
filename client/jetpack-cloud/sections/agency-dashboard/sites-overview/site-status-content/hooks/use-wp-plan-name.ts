import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';

const useWPPlanName = ( plans: Array< string > ) => {
	const translate = useTranslate();

	const getPlanName = () => {
		for ( const plan of plans ) {
			switch ( true ) {
				// Plans could be either monthly, 1 year, 2 years, or 3 years.
				// So we need to check if the plan starts with the plan slug.
				case plan.startsWith( PLAN_BUSINESS ):
					return translate( 'WordPress.com Business Plan' );
				case plan.startsWith( PLAN_ECOMMERCE ):
					return translate( 'WordPress.com Commerce Plan' );
				case plan.startsWith( PLAN_PREMIUM ):
					return translate( 'WordPress.com Premium Plan' );
				case plan.startsWith( PLAN_PERSONAL ):
					return translate( 'WordPress.com Personal Plan' );
				default:
					return '';
			}
		}
		return '';
	};

	return getPlanName();
};

export default useWPPlanName;
