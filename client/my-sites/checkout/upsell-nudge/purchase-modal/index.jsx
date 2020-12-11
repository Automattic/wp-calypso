/**
 * External dependencies
 */
import React, { useState } from 'react';
import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { CheckoutProvider } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { useSubmitTransaction } from './util';
import { BEFORE_SUBMIT } from './constants';
import Content from './content';
import Placeholder from './placeholder';
import useCreatePaymentCompleteCallback from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-complete-callback';
import existingCardProcessor from 'calypso/my-sites/checkout/composite-checkout/lib/existing-card-processor';

/**
 * Style dependencies
 */
import './style.scss';

const noop = () => null;

export function PurchaseModal( { cart, cards, isCartUpdating, onClose, siteSlug } ) {
	const translate = useTranslate();
	const [ step, setStep ] = useState( BEFORE_SUBMIT );
	const submitTransaction = useSubmitTransaction( {
		cart,
		setStep,
		storedCard: cards?.[ 0 ],
		onClose,
		successMessage: translate( 'Your purchase has been completed!' ),
	} );
	const contentProps = {
		cards,
		cart,
		onClose,
		siteSlug,
		step,
		submitTransaction,
	};

	return (
		<Dialog isVisible={ true } baseClassName="purchase-modal dialog" onClose={ onClose }>
			{ isCartUpdating ? <Placeholder /> : <Content { ...contentProps } /> }
		</Dialog>
	);
}

export default function PurchaseModalWrapper( props ) {
	const onComplete = useCreatePaymentCompleteCallback( {
		isComingFromUpsell: true,
	} );
	return (
		<CheckoutProvider
			paymentMethods={ [] }
			onPaymentComplete={ onComplete }
			showErrorMessage={ noop }
			showInfoMessage={ noop }
			showSuccessMessage={ noop }
			paymentProcessors={ { 'existing-card': existingCardProcessor } }
		>
			<PurchaseModal { ...props } />;
		</CheckoutProvider>
	);
}
