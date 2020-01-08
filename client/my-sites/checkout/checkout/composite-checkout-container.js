/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import debugFactory from 'debug';
import { useSelector } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import notices from 'notices';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import { CompositeCheckout } from './composite-checkout';

const debug = debugFactory( 'calypso:composite-checkout-container' );

export default function CompositeCheckoutContainer( {
	siteId,
	siteSlug,
	product,
	// TODO: handle these also
	// purchaseId,
	// couponCode,
} ) {
	const translate = useTranslate();
	const planSlug = useSelector( state => getUpgradePlanSlugFromPath( state, siteId, product ) );
	const isJetpackNotAtomic = useSelector(
		state => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);

	const onPaymentComplete = useCallback( () => {
		debug( 'payment completed successfully' );
		// TODO: determine which thank-you page to visit
		page.redirect( `/checkout/thank-you/${ siteId }/` );
	}, [ siteId ] );

	const showErrorMessage = useCallback(
		error => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			notices.error( message || translate( 'An error occurred during your purchase.' ) );
		},
		[ translate ]
	);

	const showInfoMessage = useCallback( message => {
		debug( 'info', message );
		notices.info( message );
	}, [] );

	const showSuccessMessage = useCallback( message => {
		debug( 'success', message );
		notices.success( message );
	}, [] );

	return (
		<CompositeCheckout
			siteSlug={ siteSlug }
			siteId={ siteId }
			onPaymentComplete={ onPaymentComplete }
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
			product={ product }
			planSlug={ planSlug }
			isJetpackNotAtomic={ isJetpackNotAtomic }
		/>
	);
}
