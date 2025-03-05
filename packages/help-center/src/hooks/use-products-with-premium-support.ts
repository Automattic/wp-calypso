import { isDIFMProduct, PLAN_100_YEARS } from '@automattic/calypso-products';
import {
	DIFM_FLOW,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
} from '@automattic/onboarding';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { FLOWS_ZENDESK_INITIAL_MESSAGES, FLOWS_ZENDESK_FLOWNAME } from '../constants';

const getUserFieldMessage = ( flowName: string, url?: string ) => {
	return `${
		FLOWS_ZENDESK_INITIAL_MESSAGES[ flowName as keyof typeof FLOWS_ZENDESK_INITIAL_MESSAGES ]
	}. URL: ${ url }`;
};

export function useProductsWithPremiumSupport( products: ResponseCartProduct[], url?: string ) {
	for ( const product of products ) {
		if ( isDIFMProduct( product ) ) {
			return {
				userFieldMessage: getUserFieldMessage( DIFM_FLOW, url ),
				userFieldFlowName:
					FLOWS_ZENDESK_FLOWNAME[ DIFM_FLOW as keyof typeof FLOWS_ZENDESK_FLOWNAME ],
				hasPremiumSupport: true,
			};
		}
		if ( product?.product_slug === PLAN_100_YEARS ) {
			return {
				userFieldMessage: getUserFieldMessage( HUNDRED_YEAR_PLAN_FLOW, url ),
				userFieldFlowName:
					FLOWS_ZENDESK_FLOWNAME[ HUNDRED_YEAR_PLAN_FLOW as keyof typeof FLOWS_ZENDESK_FLOWNAME ],
				hasPremiumSupport: true,
			};
		}
		if ( product?.extra?.is_hundred_year_domain ) {
			return {
				userFieldMessage: getUserFieldMessage( HUNDRED_YEAR_DOMAIN_FLOW, url ),
				userFieldFlowName:
					FLOWS_ZENDESK_FLOWNAME[ HUNDRED_YEAR_DOMAIN_FLOW as keyof typeof FLOWS_ZENDESK_FLOWNAME ],
				hasPremiumSupport: true,
			};
		}
	}

	return {
		hasPremiumSupport: false,
		userFieldMessage: null,
	};
}
