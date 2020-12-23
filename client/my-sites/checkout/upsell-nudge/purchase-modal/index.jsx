/**
 * External dependencies
 */
import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { useStripe } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import { useSubmitTransaction } from './util';
import { BEFORE_SUBMIT } from './constants';
import Content from './content';
import Placeholder from './placeholder';
import useCreatePaymentCompleteCallback from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-complete-callback';
import existingCardProcessor from 'calypso/my-sites/checkout/composite-checkout/lib/existing-card-processor';
import getContactDetailsType from 'calypso/my-sites/checkout/composite-checkout/lib/get-contact-details-type';

/**
 * Style dependencies
 */
import './style.scss';

const noop = () => null;

export function PurchaseModal( { cart, cards, isCartUpdating, onClose, siteSlug, siteId } ) {
	const translate = useTranslate();
	const [ step, setStep ] = useState( BEFORE_SUBMIT );
	const submitTransaction = useSubmitTransaction( {
		cart,
		siteId,
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
		<Dialog isVisible baseClassName="purchase-modal dialog" onClose={ onClose }>
			{ isCartUpdating ? <Placeholder /> : <Content { ...contentProps } /> }
		</Dialog>
	);
}

export default function PurchaseModalWrapper( props ) {
	const onComplete = useCreatePaymentCompleteCallback( {
		isComingFromUpsell: true,
	} );
	const { stripeConfiguration } = useStripe();
	const reduxDispatch = useDispatch();

	const contactDetailsType = getContactDetailsType( props.cart );
	const includeDomainDetails = contactDetailsType === 'domain';
	const includeGSuiteDetails = contactDetailsType === 'gsuite';
	const dataForProcessor = useMemo(
		() => ( {
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent: noop,
			stripeConfiguration,
			createUserAndSiteBeforeTransaction: false,
			reduxDispatch,
		} ),
		[ includeDomainDetails, includeGSuiteDetails, stripeConfiguration, reduxDispatch ]
	);

	return (
		<CheckoutProvider
			paymentMethods={ [] }
			onPaymentComplete={ onComplete }
			showErrorMessage={ noop }
			showInfoMessage={ noop }
			showSuccessMessage={ noop }
			paymentProcessors={ {
				'existing-card': ( transactionData ) =>
					existingCardProcessor( transactionData, dataForProcessor ),
			} }
		>
			<PurchaseModal { ...props } />
		</CheckoutProvider>
	);
}
