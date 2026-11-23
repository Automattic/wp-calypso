import { purchaseQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import { FLASH_QUERY_PARAM } from '../components/flash-message';
import { formatDate } from '../utils/datetime';
import { getTitleForDisplay } from '../utils/purchase';
import { getCheckoutSuccessMessage } from './checkout-success-flash';
import { useLocale } from './locale';
import type { Purchase } from '@automattic/api-core';

/**
 * Flash id and purchase param the checkout pending page adds to a successful
 * manual renewal's redirect into the Dashboard (see
 * `client/my-sites/checkout/checkout-thank-you/pending/index.tsx`). The
 * receipt names the product but not the new expiry date, so the purchase is
 * fetched here to tell the user how long it is now paid for.
 */
export const RENEWAL_SUCCESS_FLASH_ID = 'renewal-success';
export const RENEWAL_SUCCESS_PURCHASE_PARAM = 'renewed_purchase';

const AUTOMATIC_RENEWAL_SUPPORT_URL =
	'https://wordpress.com/support/manage-purchases/automatic-renewal/';

/**
 * Manually renewing also turns auto-renew back on, which the toast says so the
 * user is not surprised by the next charge. "Attempt to" keeps it accurate when
 * the payment method cannot be charged again.
 */
export function getRenewalSuccessMessage( purchase: Purchase, locale: string ): string {
	const productName = getTitleForDisplay( purchase );
	const date = purchase.expiry_date
		? formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } )
		: '';

	if ( ! date ) {
		return purchase.is_auto_renew_enabled
			? sprintf(
					/* translators: %(productName)s is the name of the renewed product, e.g. "WordPress.com Business Plan" */
					__(
						'Success! You renewed %(productName)s. We will attempt to automatically renew it in the future.'
					),
					{ productName }
				)
			: sprintf(
					/* translators: %(productName)s is the name of the renewed product, e.g. "WordPress.com Business Plan" */
					__( 'Success! You renewed %(productName)s.' ),
					{ productName }
				);
	}

	return purchase.is_auto_renew_enabled
		? sprintf(
				/* translators: %(productName)s is the name of the renewed product, e.g. "WordPress.com Business Plan"; %(date)s is the new expiry date, e.g. "June 1, 2027" */
				__(
					'Success! You renewed %(productName)s, and it is now paid through %(date)s. We will attempt to automatically renew it in the future.'
				),
				{ productName, date }
			)
		: sprintf(
				/* translators: %(productName)s is the name of the renewed product, e.g. "WordPress.com Business Plan"; %(date)s is the new expiry date, e.g. "June 1, 2027" */
				__( 'Success! You renewed %(productName)s, and it is now paid through %(date)s.' ),
				{ productName, date }
			);
}

function readRenewedPurchaseId(): number | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}
	const params = new URLSearchParams( window.location.search );
	if ( params.get( FLASH_QUERY_PARAM ) !== RENEWAL_SUCCESS_FLASH_ID ) {
		return undefined;
	}
	const purchaseId = parseInt( params.get( RENEWAL_SUCCESS_PURCHASE_PARAM ) ?? '', 10 );
	return purchaseId > 0 ? purchaseId : undefined;
}

/**
 * Shows the post-renewal success snackbar when the page loads with the
 * renewal flash params, then clears them from the URL. Rendered in the app
 * shell because checkout returns the user to whichever Dashboard page they
 * renewed from.
 */
export function RenewalSuccessFlashMessage() {
	const [ purchaseId ] = useState( readRenewedPurchaseId );
	const locale = useLocale();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const {
		data: purchase,
		isError,
		isSuccess,
	} = useQuery( {
		...purchaseQuery( purchaseId ?? 0 ),
		enabled: Boolean( purchaseId ),
	} );

	useEffect( () => {
		if ( ! purchaseId ) {
			return;
		}
		const params = new URLSearchParams( window.location.search );
		params.delete( FLASH_QUERY_PARAM );
		params.delete( RENEWAL_SUCCESS_PURCHASE_PARAM );
		const newUrl = window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
		window.history.replaceState( {}, '', newUrl );
	}, [ purchaseId ] );

	useEffect( () => {
		if ( ! purchaseId || ( ! isSuccess && ! isError ) ) {
			return;
		}
		if ( ! purchase ) {
			createSuccessNotice( getCheckoutSuccessMessage(), { type: 'snackbar' } );
			return;
		}
		createSuccessNotice( getRenewalSuccessMessage( purchase, locale ), {
			type: 'snackbar',
			explicitDismiss: true,
			actions: purchase.is_auto_renew_enabled
				? [
						{
							label: __( 'Learn more about renewals' ),
							url: localizeUrl( AUTOMATIC_RENEWAL_SUPPORT_URL, locale ),
						},
					]
				: [],
		} );
		// The notice is a one-off for the page load that carried the params.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ purchaseId, isSuccess, isError ] );

	return null;
}
