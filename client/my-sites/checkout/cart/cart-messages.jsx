/**
 * External dependencies
 */
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import { getNewMessages } from 'calypso/lib/cart-values';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function CartMessages( { cart, isLoadingCart } ) {
	const previousCart = useRef( null );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	useEffect( () => {
		displayCartMessages( {
			cart,
			isLoadingCart,
			translate,
			selectedSiteSlug,
			previousCart: previousCart.current,
		} );
		previousCart.current = cart;
	}, [ cart, isLoadingCart, translate, selectedSiteSlug ] );

	return null;
}

function getChargebackErrorMessage( { translate, selectedSiteSlug } ) {
	return translate(
		'{{strong}}Warning:{{/strong}} One or more transactions linked to this site were refunded due to a contested charge. ' +
			'This may have happened because of a chargeback by the credit card holder or a PayPal investigation. Each contested ' +
			'charge carries a fine. To resolve the issue and re-enable posting, please {{a}}pay for the chargeback fine{{/a}}.',
		{
			components: {
				strong: <strong />,
				a: <a href={ '/checkout/' + selectedSiteSlug ?? '' } />,
			},
		}
	);
}

function getBlockedPurchaseErrorMessage( { translate, selectedSiteSlug } ) {
	return translate(
		'Purchases are currently disabled. Please {{a}}contact us{{/a}} to re-enable purchases.',
		{
			components: {
				a: (
					<a
						href={
							'https://wordpress.com/error-report/' + selectedSiteSlug
								? '?url=payment@' + selectedSiteSlug
								: ''
						}
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);
}

function getPrettyErrorMessages( messages, { translate, selectedSiteSlug } ) {
	if ( ! messages ) {
		return [];
	}

	return messages.map( ( error ) => {
		switch ( error.code ) {
			case 'chargeback':
				return Object.assign( error, {
					message: getChargebackErrorMessage( { translate, selectedSiteSlug } ),
				} );

			case 'blocked':
				return Object.assign( error, {
					message: getBlockedPurchaseErrorMessage( { translate, selectedSiteSlug } ),
				} );

			default:
				return error;
		}
	} );
}

function displayCartMessages( { cart, isLoadingCart, translate, selectedSiteSlug, previousCart } ) {
	const newCart = cart;
	if ( isLoadingCart ) {
		return;
	}
	const messages = getNewMessages( previousCart, newCart );

	messages.errors = getPrettyErrorMessages( messages.errors, { translate, selectedSiteSlug } );

	if ( messages.errors?.length > 0 ) {
		notices.error(
			messages.errors.map( ( error ) => (
				<p key={ `${ error.code }-${ error.message }` }>{ error.message }</p>
			) ),
			{ persistent: true }
		);
		return;
	}

	if ( messages.success?.length > 0 ) {
		notices.success(
			messages.success.map( ( success ) => (
				<p key={ `${ success.code }-${ success.message }` }>{ success.message }</p>
			) )
		);
		return;
	}
}
