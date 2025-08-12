import { isDIFMProduct, PLAN_100_YEARS } from '@automattic/calypso-products';
import {
	DIFM_FLOW,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
} from '@automattic/onboarding';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { __ } from '@wordpress/i18n';
/* eslint-disable no-restricted-imports */
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { FLOWS_ZENDESK_INITIAL_MESSAGES, FLOWS_ZENDESK_FLOWNAME } from '../constants';
import { useSupportStatus } from '../data/use-support-status';

const getUserFieldMessage = ( flowName: string, url?: string ) => {
	return `${
		FLOWS_ZENDESK_INITIAL_MESSAGES[ flowName as keyof typeof FLOWS_ZENDESK_INITIAL_MESSAGES ]
	}. URL: ${ url }`;
};

export function useProductsWithPremiumSupport(
	products: ResponseCartProduct[],
	url?: string
): {
	userFieldMessage: string | null;
	userFieldFlowName?: string;
	hasPremiumSupport: boolean;
	helpCenterButtonCopy?: string;
	helpCenterButtonLink: string;
} {
	const { data: supportStatus } = useSupportStatus();
	const { data: geoData } = useGeoLocationQuery();

	const defaultButtonLink = __( 'Need help?', __i18n_text_domain__ );

	for ( const product of products ) {
		if ( isDIFMProduct( product ) ) {
			const hasPremiumSupport =
				supportStatus?.availability.is_difm_chat_open && geoData?.country_short === 'US';
			return {
				userFieldMessage: getUserFieldMessage( DIFM_FLOW, url ),
				userFieldFlowName:
					FLOWS_ZENDESK_FLOWNAME[ DIFM_FLOW as keyof typeof FLOWS_ZENDESK_FLOWNAME ],
				hasPremiumSupport: hasPremiumSupport || false,
				helpCenterButtonCopy: hasPremiumSupport
					? __( 'Questions?', __i18n_text_domain__ )
					: undefined,
				helpCenterButtonLink: hasPremiumSupport
					? __( 'Contact our site-building team', __i18n_text_domain__ )
					: defaultButtonLink,
			};
		}
		if ( product?.product_slug === PLAN_100_YEARS ) {
			return {
				userFieldMessage: getUserFieldMessage( HUNDRED_YEAR_PLAN_FLOW, url ),
				userFieldFlowName:
					FLOWS_ZENDESK_FLOWNAME[ HUNDRED_YEAR_PLAN_FLOW as keyof typeof FLOWS_ZENDESK_FLOWNAME ],
				hasPremiumSupport: true,
				helpCenterButtonLink: defaultButtonLink,
			};
		}
		if ( product?.extra?.is_hundred_year_domain ) {
			return {
				userFieldMessage: getUserFieldMessage( HUNDRED_YEAR_DOMAIN_FLOW, url ),
				userFieldFlowName:
					FLOWS_ZENDESK_FLOWNAME[ HUNDRED_YEAR_DOMAIN_FLOW as keyof typeof FLOWS_ZENDESK_FLOWNAME ],
				hasPremiumSupport: true,
				helpCenterButtonLink: defaultButtonLink,
			};
		}
	}

	return {
		hasPremiumSupport: false,
		userFieldMessage: null,
		helpCenterButtonLink: defaultButtonLink,
	};
}
