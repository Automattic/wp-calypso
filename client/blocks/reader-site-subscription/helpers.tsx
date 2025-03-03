import { Reader } from '@automattic/data-stores';
import { getCurrencyObject } from 'i18n-calypso';
import moment from 'moment';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
} from 'calypso/my-sites/earn/memberships/constants';

export type SiteSubscriptionDetailsProps = {
	subscriptionId: number;
	subscriberCount: number;
	dateSubscribed: string;
	siteIcon: string | null;
	name: string;
	blogId: number;
	feedId: number;
	deliveryMethods: Reader.SiteSubscriptionDeliveryMethods;
	url: string;
	paymentDetails: Reader.SiteSubscriptionPaymentDetails[];
};

export type PaymentPlan = {
	is_gift: boolean;
	id: string;
	renewalPrice: string;
	renewalDate: string;
};

export const getPaymentInterval = ( renew_interval: string ) => {
	if ( renew_interval === null ) {
		return 'one time';
	} else if ( renew_interval === PLAN_MONTHLY_FREQUENCY ) {
		return 'per month';
	} else if ( renew_interval === PLAN_YEARLY_FREQUENCY ) {
		return 'per year';
	}
};

export function formatRenewalPrice( renewalPrice: string, currency: string ) {
	if ( ! renewalPrice ) {
		return '';
	}

	const money = getCurrencyObject( parseFloat( renewalPrice ), currency );
	return money.integer !== '0' ? `${ money.symbol }${ money.integer } /` : '';
}

export function formatRenewalDate( renewalDate: string, localeSlug: string ) {
	if ( ! renewalDate ) {
		return '';
	}

	const date = moment( renewalDate );
	return date.locale( localeSlug ).format( 'LL' );
}
