import { Reader } from '@automattic/data-stores';
import { getCurrencyObject } from '@automattic/format-currency';
import moment from 'moment';

export type SiteSubscriptionDetailsProps = {
	subscriberCount: number;
	dateSubscribed: Date;
	siteIcon: string | null;
	name: string;
	blogId: string;
	deliveryMethods: Reader.SiteSubscriptionDeliveryMethods;
	url: string;
	paymentDetails: Reader.SiteSubscriptionPaymentDetails[];
};

export type PaymentPlan = {
	id: string;
	renewalPrice: string;
	renewalDate: string;
};

export const getPaymentInterval = ( renew_interval: string ) => {
	if ( renew_interval === null ) {
		return 'one time';
	} else if ( renew_interval === '1 month' ) {
		return 'per month';
	} else if ( renew_interval === '1 year' ) {
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
