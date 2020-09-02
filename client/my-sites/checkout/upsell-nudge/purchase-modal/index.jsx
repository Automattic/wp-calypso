/**
 * External dependencies
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { find, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import { submit } from 'lib/store-transactions';
import {
	INPUT_VALIDATION,
	RECEIVED_WPCOM_RESPONSE,
	SUBMITTING_WPCOM_REQUEST,
} from 'lib/store-transactions/step-types';
import { preprocessCartForServer } from 'lib/cart-values';
import { errorNotice } from 'state/notices/actions';
import { Dialog } from '@automattic/components';
import Spinner from 'components/spinner';
import MaterialIcon from 'components/material-icon';

/**
 * Style dependencies
 */
import './style.scss';

const BEFORE_START = 'before-start';

function extractStoredCardMetaValue( card, key ) {
	return find( card.meta, [ 'meta_key', key ] )?.meta_value;
}

function generateTransactionData( cart, storedCard ) {
	const countryCode = extractStoredCardMetaValue( storedCard, 'country_code' );
	const postalCode = extractStoredCardMetaValue( storedCard, 'card_zip' );

	return {
		cart: {
			...pick( cart, [ 'blog_id', 'cart_key' ] ),
			...preprocessCartForServer( cart ),
			create_new_blog: false,
		},
		domainDetails: null,
		payment: {
			paymentMethod: 'WPCOM_Billing_MoneyPress_Stored',
			storedCard,
			name: storedCard.name,
			country: countryCode,
			country_code: countryCode,
			postal_code: postalCode,
			zip: postalCode,
		},
	};
}

function PurchaseModalContent( { step } ) {
	const translate = useTranslate();

	if ( [ BEFORE_START, INPUT_VALIDATION, SUBMITTING_WPCOM_REQUEST ].includes( step ) ) {
		return (
			<>
				<Spinner size={ 48 } />
				<p>{ translate( 'Updating your order' ) }</p>
			</>
		);
	}

	if ( [ RECEIVED_WPCOM_RESPONSE ].includes( step ) ) {
		return (
			<>
				<p>{ translate( 'Your order has been processed' ) }</p>
				<MaterialIcon icon="check_circle" className="purchase-modal__success" />
			</>
		);
	}

	return null;
}

export function PurchaseModal( { cart, cards, onComplete, onClose } ) {
	const [ step, setStep ] = useState( BEFORE_START );
	const dispatch = useDispatch();
	const onStep = useCallback(
		( { name, data, error } ) => {
			if ( error ) {
				recordTracksEvent( 'calypso_oneclick_upsell_payment_error', {
					error_code: error.code || error.error,
					reason: error.message,
				} );
				dispatch( errorNotice( error.message ) );
				onClose();
				return;
			}

			setStep( name );

			if ( RECEIVED_WPCOM_RESPONSE === name && data && ! error ) {
				recordTracksEvent( 'calypso_oneclick_upsell_payment_success', {} );
				onComplete?.();
			}
		},
		[ step ]
	);

	useEffect( () => {
		if ( step !== BEFORE_START ) {
			return;
		}

		submit( generateTransactionData( cart, cards[ 0 ] ), onStep );
	}, [ cart, cards ] );

	return (
		<Dialog isVisible={ true } className="purchase-modal">
			<PurchaseModalContent step={ step } />
		</Dialog>
	);
}
