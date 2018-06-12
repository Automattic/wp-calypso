/** @format */
/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize, moment } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import config from 'config';
import Button from 'components/button';
import { cancelAndRefundPurchase, cancelPurchase, submitSurvey } from 'lib/upgrades/actions';
import { clearPurchases } from 'state/purchases/actions';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import { connect } from 'react-redux';
import Dialog from 'components/dialog';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import enrichedSurveyData from 'components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import initialSurveyState from 'components/marketing-survey/cancel-purchase-form/initial-survey-state';
import isSurveyFilledIn from 'components/marketing-survey/cancel-purchase-form/is-survey-filled-in';
import stepsForProductAndSurvey from 'components/marketing-survey/cancel-purchase-form/steps-for-product-and-survey';
import nextStep from 'components/marketing-survey/cancel-purchase-form/next-step';
import previousStep from 'components/marketing-survey/cancel-purchase-form/previous-step';
import { INITIAL_STEP, FINAL_STEP } from 'components/marketing-survey/cancel-purchase-form/steps';
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
		selectedSite: PropTypes.object,
		cancelBundledDomain: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		disabled: PropTypes.bool,
	};

	state = {
		disabled: false,
		showDialog: false,
		isRemoving: false,
		surveyStep: INITIAL_STEP,
		survey: initialSurveyState(),
	};

	recordEvent = ( name, properties = {} ) => {
		const { purchase } = this.props;
		const product_slug = get( purchase, 'productSlug' );
		const cancellation_flow = isRefundable( purchase ) ? 'cancel_with_refund' : 'cancel_autorenew';
		this.props.recordTracksEvent(
			name,
			Object.assign( { cancellation_flow, product_slug }, properties )
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
			surveyStep: INITIAL_STEP,
			survey: initialSurveyState(),
		} );
	};

	chatInitiated = () => {
		this.recordEvent( 'calypso_purchases_cancel_form_chat_initiated' );
		this.closeDialog();
	};

	changeSurveyStep = stepFunction => {
		const { purchase, isChatAvailable, isChatActive, precancellationChatAvailable } = this.props;
		const { surveyStep, survey } = this.state;
		const steps = stepsForProductAndSurvey(
			survey,
			purchase,
			isChatAvailable || isChatActive,
			precancellationChatAvailable
		);
		const newStep = stepFunction( surveyStep, steps );
		this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: newStep } );
		this.setState( { surveyStep: newStep } );
	};

	clickNext = () => {
		if ( this.state.isRemoving || ! isSurveyFilledIn( this.state.survey ) ) {
			return;
		}
		this.changeSurveyStep( nextStep );
	};

	clickPrevious = () => {
		if ( this.state.isRemoving ) {
			return;
		}
		this.changeSurveyStep( previousStep );
	};

	onSurveyChange = update => {
		this.setState( {
			survey: update,
		} );
	};

	renderCancelConfirmationDialog = () => {
		const { purchase, selectedSite, translate } = this.props;
		const buttons = {
			close: {
				action: 'close',
				label: translate( "I'll Keep It" ),
			},
			next: {
				action: 'next',
				disabled: this.state.isRemoving || ! isSurveyFilledIn( this.state.survey ),
				label: translate( 'Next Step' ),
				onClick: this.clickNext,
			},
			prev: {
				action: 'prev',
				disabled: this.state.isRemoving,
				label: translate( 'Previous Step' ),
				onClick: this.clickPrevious,
			},
			cancel: {
				action: 'cancel',
				label: translate( 'Cancel Now' ),
				isPrimary: true,
				disabled: this.state.submitting,
				onClick: this.submitCancelAndRefundPurchase,
			},
		};

		let buttonsArr;
		if ( ! config.isEnabled( 'upgrades/removal-survey' ) ) {
			buttonsArr = [ buttons.close, buttons.cancel ];
		} else if ( this.state.surveyStep === FINAL_STEP ) {
			buttonsArr = [ buttons.close, buttons.prev, buttons.cancel ];
		} else {
			buttonsArr =
				this.state.surveyStep === INITIAL_STEP
					? [ buttons.close, buttons.next ]
					: [ buttons.close, buttons.prev, buttons.next ];
		}

		return (
			<Dialog
				isVisible={ this.state.showDialog }
				buttons={ buttonsArr }
				onClose={ this.closeDialog }
				className="cancel-purchase__button-warning-dialog"
			>
				<CancelPurchaseForm
					chatInitiated={ this.chatInitiated }
					defaultContent={ this.renderCancellationEffect() }
					onInputChange={ this.onSurveyChange }
					purchase={ purchase }
					selectedSite={ selectedSite }
					showSurvey={ config.isEnabled( 'upgrades/removal-survey' ) }
					surveyStep={ this.state.surveyStep }
				/>
			</Dialog>
		);
	};

	goToCancelConfirmation = () => {
		const { id } = this.props.purchase;
		page( confirmCancelDomain( id ) );
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
		const { purchase, selectedSite } = this.props;
		const refundable = isRefundable( purchase );
		const cancelBundledDomain = this.props.cancelBundledDomain;
		this.setState( {
			submitting: true,
		} );

		if ( config.isEnabled( 'upgrades/removal-survey' ) ) {
			const surveyData = {
				'why-cancel': {
					response: this.state.survey.questionOneRadio,
					text: this.state.survey.questionOneText,
				},
				'next-adventure': {
					response: this.state.survey.questionTwoRadio,
					text: this.state.survey.questionTwoText,
				},
				'what-better': { text: this.state.survey.questionThreeText },
				type: refundable ? 'refund' : 'cancel-autorenew',
			};

			submitSurvey(
				'calypso-remove-purchase',
				purchase.siteId,
				enrichedSurveyData( surveyData, moment(), selectedSite, purchase )
			);
		}

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
			overrides.refundText =
				purchase.currencySymbol + ( purchase.refundAmount + includedDomainPurchase.amount );
		}

		return (
			<p>
				{ cancellationEffectHeadline( purchase, translate ) }
				{ cancellationEffectDetail( purchase, translate, overrides ) }
			</p>
		);
	};

	render() {
		const { purchase, translate } = this.props;

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
				{ this.renderCancelConfirmationDialog() }
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
