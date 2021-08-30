import { isDomainRegistration } from '@automattic/calypso-products';
import { Button, Fill } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import page from 'page';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import DocumentHead from 'calypso/components/data/document-head';
import HappychatButton from 'calypso/components/happychat/button';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import MaterialIcon from 'calypso/components/material-icon';
import {
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	isSubscription,
} from 'calypso/lib/purchases';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import { fetchSitePurchases } from 'calypso/state/purchases/actions';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import getSupportVariation, {
	SUPPORT_HAPPYCHAT,
} from 'calypso/state/selectors/get-inline-help-support-variation';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Feedback, submitFeedback } from './steps/feedback';

import './style.scss';

const steps = [ { component: Feedback, onSubmit: submitFeedback } ];

export const PurchaseCancelConfirm = ( { purchaseId, siteSlug } ) => {
	const [ currentStep ] = useState( 0 );
	const [ isValidStep, setIsValidStep ] = useState( false );

	const purchase = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );
	const siteId = useSelector( getSelectedSiteId );
	const backUrl = `/purchases/subscriptions/${ siteSlug }/${ purchaseId }/cancel`;
	const canChat = useSelector(
		( state ) =>
			( isHappychatAvailable( state ) || hasActiveHappychatSession( state ) ) &&
			getSupportVariation( state ) === SUPPORT_HAPPYCHAT
	);
	const isAtomicSite = useSelector( ( state ) =>
		isSiteAutomatedTransfer( state, purchase?.siteId )
	);

	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchSitePurchases( siteId ) );
	}, [ siteId, dispatch ] );

	if ( ! purchase ) {
		return null;
	}

	let title;
	const isRefundable = hasAmountAvailableToRefund( purchase );

	if ( isRefundable ) {
		if ( isDomainRegistration( purchase ) ) {
			title = __( 'Cancel Domain and Refund' );
		}

		if ( isSubscription( purchase ) ) {
			title = __( 'Cancel Subscription' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			title = __( 'Cancel and Refund' );
		}
	} else {
		if ( isDomainRegistration( purchase ) ) {
			title = __( 'Cancel Domain' );
		}

		if ( isSubscription( purchase ) ) {
			title = __( 'Cancel Subscription' );
		}
	}

	const flowType = isRefundable
		? CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND
		: CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;

	const trackEvent = ( name, properties = {} ) =>
		dispatch(
			recordTracksEvent( name, {
				cancellation_flow: flowType,
				product_slug: purchase?.productSlug,
				is_atomic: isAtomicSite,
				...properties,
			} )
		);

	const CurrentStepComponent = steps[ currentStep.component ];
	const submit = () => {
		trackEvent( 'calypso_purchases_cancel_form_submit' );
		currentStep.onSubmit && currentStep.onSubmit();
	};

	return (
		<>
			<DocumentHead title={ title } />
			<QuerySupportTypes />
			<BlankCanvas backUrl={ backUrl }>
				<Fill name="BlankCanvas.Content">
					<CurrentStepComponent
						onValidate={ ( isValid ) => {
							setIsValidStep( isValid );
						} }
						purchase={ purchase }
						trackEvent={ trackEvent }
					/>
				</Fill>
				<Fill name="BlankCanvas.Footer">
					<div className="purchase-cancel-confirm__actions">
						<div className="purchase-cancel-confirm__buttons">
							<Button isPrimary href={ backUrl }>
								{ __( 'Keep my plan' ) }
							</Button>
							<Button isDefault disabled={ ! isValidStep } onClick={ () => submit() }>
								{ __( 'Cancel plan' ) }
							</Button>
						</div>
						{ canChat && (
							<HappychatButton
								className="purchase-cancel-confirm__chat"
								borderless
								onClick={ () => {
									trackEvent( 'calypso_purchases_cancel_form_chat_initiated' );
									page( backUrl );
								} }
							>
								<MaterialIcon icon="chat_bubble" />
								{ __( 'Need help? Chat with us' ) }
							</HappychatButton>
						) }
					</div>
				</Fill>
			</BlankCanvas>
		</>
	);
};
