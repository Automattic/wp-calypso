/**
 * External dependencies
 */
import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { useStripe } from '@automattic/calypso-stripe';
import { useShoppingCart } from '@automattic/shopping-cart';

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
import { getSelectedSite } from 'calypso/state/ui/selectors';

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
		<Dialog isVisible={ true } baseClassName="purchase-modal dialog" onClose={ onClose }>
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
	const { responseCart } = useShoppingCart();
	const selectedSite = useSelector( getSelectedSite );

	const contactDetailsType = getContactDetailsType( props.cart );
	const includeDomainDetails = contactDetailsType === 'domain';
	const includeGSuiteDetails = contactDetailsType === 'gsuite';
	// NOTE: dataForProcessor must satisfy the PaymentProcessorOptions type
	const dataForProcessor = useMemo(
		() => ( {
			createUserAndSiteBeforeTransaction: false,
			getThankYouUrl: () => '/plans',
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent: noop,
			reduxDispatch,
			responseCart,
			siteSlug: selectedSite?.slug ?? '',
			siteId: selectedSite?.ID ?? '',
			stripeConfiguration,
		} ),
		[
			includeDomainDetails,
			includeGSuiteDetails,
			stripeConfiguration,
			reduxDispatch,
			selectedSite,
			responseCart,
		]
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
