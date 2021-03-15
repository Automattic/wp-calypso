/**
 * External dependencies
 */
import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getNewMessages } from 'calypso/lib/cart-values';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { JETPACK_SUPPORT } from 'calypso/lib/url/support';

export default function CartMessages( { cart, isLoadingCart } ) {
	const previousCart = useRef( null );
	const reduxDispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	useEffect( () => {
		displayCartMessages( {
			cart,
			isLoadingCart,
			translate,
			selectedSiteSlug,
			previousCart: previousCart.current,
			reduxDispatch,
		} );
		previousCart.current = cart;
	}, [ cart, isLoadingCart, translate, selectedSiteSlug, reduxDispatch ] );

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
							'https://wordpress.com/error-report/' +
							( selectedSiteSlug ? '?url=payment@' + selectedSiteSlug : '' )
						}
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);
}

function getInvalidMultisitePurchaseErrorMessage( { translate, message } ) {
	return (
		<>
			{ message }&nbsp;
			<a
				href={ JETPACK_SUPPORT + 'backup/#does-jetpack-backup-support-multisite' }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'More info' ) }
			</a>
		</>
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

			case 'invalid-product-multisite':
				return Object.assign( error, {
					message: getInvalidMultisitePurchaseErrorMessage( { translate, message: error.message } ),
				} );

			default:
				return error;
		}
	} );
}

function displayCartMessages( {
	cart,
	isLoadingCart,
	translate,
	selectedSiteSlug,
	previousCart,
	reduxDispatch,
} ) {
	const newCart = cart;
	if ( isLoadingCart ) {
		return;
	}
	const messages = getNewMessages( previousCart, newCart );

	messages.errors = getPrettyErrorMessages( messages.errors, { translate, selectedSiteSlug } );

	if ( messages.errors?.length > 0 ) {
		reduxDispatch(
			errorNotice(
				messages.errors.map( ( error ) => (
					<p key={ `${ error.code }-${ error.message }` }>{ error.message }</p>
				) ),
				{ isPersistent: true }
			)
		);
		return;
	}

	if ( messages.success?.length > 0 ) {
		reduxDispatch(
			successNotice(
				messages.success.map( ( success ) => (
					<p key={ `${ success.code }-${ success.message }` }>{ success.message }</p>
				) )
			)
		);
		return;
	}
}
