/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { getCurrencyDefaults } from '@automattic/format-currency';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import { cancelAndRefundPurchase, cancelPurchase } from 'lib/upgrades/actions';
import { clearPurchases } from 'state/purchases/actions';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import {
	getName,
	getSubscriptionEndDate,
	isOneTimePurchase,
	isRefundable,
	isSubscription,
} from 'lib/purchases';
import { isDomainRegistration } from 'lib/products-values';
import notices from 'notices';
import { confirmCancelDomain, purchasesRoot } from 'me/purchases/paths';
import { refreshSitePlans } from 'state/sites/plans/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { cancellationEffectDetail, cancellationEffectHeadline } from './cancellation-effect';
import isPrecancellationChatAvailable from 'state/happychat/selectors/is-precancellation-chat-available';

class CancelPurchaseButton extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
		cancelBundledDomain: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		disabled: PropTypes.bool,
	};

	state = {
		disabled: false,
		showDialog: false,
		survey: {},
	};

	getCancellationFlowType = () => {
		return isRefundable( this.props.purchase ) ? 'cancel_with_refund' : 'cancel_autorenew';
	};

	recordEvent = ( name, properties = {} ) => {
		const { purchase } = this.props;
		const product_slug = get( purchase, 'productSlug' );

		this.props.recordTracksEvent(
			name,
			Object.assign(
				{ cancellation_flow: this.getCancellationFlowType(), product_slug },
				properties
			)
		);
	};

	handleCancelPurchaseClick = () => {
		if ( isDomainRegistration( this.props.purchase ) ) {
			return this.goToCancelConfirmation();
		}

		this.recordEvent( 'calypso_purchases_cancel_form_start' );

		this.setState( {
			showDialog: true,
		} );
	};

	closeDialog = () => {
		this.recordEvent( 'calypso_purchases_cancel_form_close' );

		this.setState( {
			showDialog: false,
		} );
	};

	chatInitiated = () => {
		this.recordEvent( 'calypso_purchases_cancel_form_chat_initiated' );
		this.closeDialog();
	};

	onStepChange = newStep => {
		this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: newStep } );
	};

	onSurveyChange = update => {
		this.setState( {
			survey: update,
		} );
	};

	goToCancelConfirmation = () => {
		const { id } = this.props.purchase,
			{ slug } = this.props.selectedSite;

		page( confirmCancelDomain( slug, id ) );
	};

	cancelPurchase = () => {
		const { purchase, translate } = this.props;

		this.setDisabled( true );

		cancelPurchase( purchase.id, success => {
			const purchaseName = getName( purchase ),
				subscriptionEndDate = getSubscriptionEndDate( purchase );

			this.props.refreshSitePlans( purchase.siteId );

			this.props.clearPurchases();

			if ( success ) {
				notices.success(
					translate(
						'%(purchaseName)s was successfully cancelled. It will be available ' +
							'for use until it expires on %(subscriptionEndDate)s.',
						{
							args: {
								purchaseName,
								subscriptionEndDate,
							},
						}
					),
					{ persistent: true }
				);

				page( purchasesRoot );
			} else {
				notices.error(
					translate(
						'There was a problem canceling %(purchaseName)s. ' +
							'Please try again later or contact support.',
						{
							args: { purchaseName },
						}
					)
				);
				this.cancellationFailed();
			}
		} );
	};

	cancellationFailed = () => {
		this.closeDialog();

		this.setState( {
			submitting: false,
		} );
	};

	setDisabled = disabled => {
		this.setState( { disabled } );
	};

	handleSubmit = ( error, response ) => {
		if ( error ) {
			notices.error( error.message );

			this.cancellationFailed();

			return;
		}

		notices.success( response.message, { persistent: true } );

		this.props.refreshSitePlans( this.props.purchase.siteId );

		this.props.clearPurchases();

		page.redirect( purchasesRoot );
	};

	submitCancelAndRefundPurchase = () => {
		const { purchase } = this.props;
		const refundable = isRefundable( purchase );
		const cancelBundledDomain = this.props.cancelBundledDomain;

		this.recordEvent( 'calypso_purchases_cancel_form_submit' );

		if ( refundable ) {
			cancelAndRefundPurchase(
				purchase.id,
				{ product_id: purchase.productId, cancel_bundled_domain: cancelBundledDomain ? 1 : 0 },
				this.handleSubmit
			);
		} else {
			this.cancelPurchase();
		}
	};

	renderCancellationEffect = () => {
		const { purchase, translate, includedDomainPurchase, cancelBundledDomain } = this.props;
		const overrides = {};

		if (
			cancelBundledDomain &&
			includedDomainPurchase &&
			isDomainRegistration( includedDomainPurchase )
		) {
			const { precision } = getCurrencyDefaults( purchase.currencyCode );
			overrides.refundText =
				purchase.currencySymbol +
				parseFloat( purchase.refundAmount + includedDomainPurchase.amount ).toFixed( precision );
		}

		return (
			<p>
				{ cancellationEffectHeadline( purchase, translate ) }
				{ cancellationEffectDetail( purchase, translate, overrides ) }
			</p>
		);
	};

	render() {
		const { purchase, selectedSite, translate } = this.props;

		let text, onClick;

		if ( isRefundable( purchase ) ) {
			onClick = this.handleCancelPurchaseClick;

			if ( isDomainRegistration( purchase ) ) {
				text = translate( 'Cancel Domain and Refund' );
			}

			if ( isSubscription( purchase ) ) {
				text = translate( 'Cancel Subscription' );
			}

			if ( isOneTimePurchase( purchase ) ) {
				text = translate( 'Cancel and Refund' );
			}
		} else {
			onClick = this.cancelPurchase;

			if ( isDomainRegistration( purchase ) ) {
				text = translate( 'Cancel Domain' );
			}

			if ( isSubscription( purchase ) ) {
				onClick = this.handleCancelPurchaseClick;
				text = translate( 'Cancel Subscription' );
			}
		}

		return (
			<div>
				<Button
					className="cancel-purchase__button"
					disabled={ this.state.disabled || this.props.disabled }
					onClick={ onClick }
					primary
				>
					{ text }
				</Button>
				<CancelPurchaseForm
					chatInitiated={ this.chatInitiated }
					defaultContent={ this.renderCancellationEffect() }
					onInputChange={ this.onSurveyChange }
					purchase={ purchase }
					selectedSite={ selectedSite }
					isVisible={ this.state.showDialog }
					onClose={ this.closeDialog }
					onStepChange={ this.onStepChange }
					onClickFinalConfirm={ this.submitCancelAndRefundPurchase }
					flowType={ this.getCancellationFlowType() }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: hasActiveHappychatSession( state ),
		precancellationChatAvailable: isPrecancellationChatAvailable( state ),
	} ),
	{
		clearPurchases,
		recordTracksEvent,
		refreshSitePlans,
	}
)( localize( CancelPurchaseButton ) );
