/**
 * External Dependencies
 */
import page from 'page';
import React, { Component, PropTypes } from 'react';
import { moment } from 'i18n-calypso';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import Button from 'components/button';
import { cancelAndRefundPurchase, cancelPurchase, submitSurvey } from 'lib/upgrades/actions';
import { clearPurchases } from 'state/purchases/actions';
import { connect } from 'react-redux';
import Dialog from 'components/dialog';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import { getName, getSubscriptionEndDate, isOneTimePurchase, isRefundable, isSubscription } from 'lib/purchases';
import { enrichedSurveyData } from '../utils';
import { isDomainRegistration, isJetpackPlan, isBusiness } from 'lib/products-values';
import notices from 'notices';
import paths from 'me/purchases/paths';
import { refreshSitePlans } from 'state/sites/plans/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { cancellationEffectDetail, cancellationEffectHeadline } from './cancellation-effect';

class CancelPurchaseButton extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired
	}

	state = {
		disabled: false,
		showDialog: false,
		isRemoving: false,
		surveyStep: 1,
		finalStep: 2,
		survey: {
			questionOneRadio: null,
			questionTwoRadio: null
		}
	}

	recordEvent = ( name, properties = {} ) => {
		const { purchase } = this.props;
		const product_slug = get( purchase, 'productSlug' );
		const cancellation_flow = isRefundable( purchase ) ? 'cancel_with_refund' : 'cancel_autorenew';
		this.props.recordTracksEvent(
			name,
			Object.assign( { cancellation_flow, product_slug }, properties )
		);
	}

	handleCancelPurchaseClick = () => {
		if ( isDomainRegistration( this.props.purchase ) ) {
			return this.goToCancelConfirmation();
		}

		this.recordEvent( 'calypso_purchases_cancel_form_start' );

		this.setState( {
			showDialog: true
		} );
	}

	closeDialog = () => {
		this.recordEvent( 'calypso_purchases_cancel_form_close' );

		this.setState( {
			showDialog: false,
			surveyStep: 1,
			survey: {
				questionOneRadio: null,
				questionTwoRadio: null
			}
		} );
	}

	recordSurveyStepChange = ( currentStep, nextStep, finalStep ) => {
		if ( nextStep === 1 ) {
			this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: 'initial_step' } );
		} else if ( nextStep === 2 && finalStep === 3 ) {
			this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: 'concierge_step' } );
		} else {
			this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: 'cancellation_step' } );
		}
	}

	changeSurveyStep = ( direction ) => {
		const { purchase } = this.props;
		let newStep, finalStep;

		if ( purchase && isBusiness( purchase ) &&
			this.state.survey.questionOneRadio === 'tooHard' &&
			abtest( 'conciergeOfferOnCancel' ) === 'showConciergeOffer'
		) {
			finalStep = 3;
			this.setState( { finalStep: finalStep } );

			switch ( this.state.surveyStep ) {
				case 1:
					newStep = 2;
					break;
				case 2:
					newStep = direction === 'previous' ? 1 : 3;
					break;
				case 3:
					newStep = 2;
					break;
				default:
					newStep = 1;
					break;
			}
		} else {
			finalStep = 2;
			newStep = this.state.surveyStep === 1 ? 2 : 1;
			this.setState( { finalStep: finalStep } );
		}

		this.recordSurveyStepChange( this.state.surveyStep, newStep, finalStep );
		this.setState( { surveyStep: newStep } );
	}

	onSurveyChange = ( update ) => {
		this.setState( {
			survey: update,
		} );
	}

	isSurveyIncomplete = () => {
		return this.state.survey.questionOneRadio === null || this.state.survey.questionTwoRadio === null ||
			( this.state.survey.questionOneRadio === 'anotherReasonOne' && this.state.survey.questionOneText === '' ) ||
			( this.state.survey.questionTwoRadio === 'anotherReasonTwo' && this.state.survey.questionTwoText === '' );
	}

	renderCancelConfirmationDialog = () => {
		const { purchase, translate } = this.props;
		const buttons = {
			close: {
				action: 'close',
				label: translate( "No, I'll Keep It" )
			},
			next: {
				action: 'next',
				disabled: this.state.isRemoving || this.isSurveyIncomplete(),
				label: translate( 'Next Step' ),
				onClick: this.changeSurveyStep
			},
			prev: {
				action: 'prev',
				disabled: this.state.isRemoving,
				label: translate( 'Previous Step' ),
				onClick: this.changeSurveyStep.bind( null, 'previous' )
			},
			cancel: {
				action: 'cancel',
				label: translate( 'Yes, Cancel Now' ),
				isPrimary: true,
				disabled: this.state.submitting,
				onClick: this.submitCancelAndRefundPurchase
			}
		};
		const inFinalStep = ( this.state.surveyStep === this.state.finalStep );

		let buttonsArr;
		if ( ! config.isEnabled( 'upgrades/removal-survey' ) ) {
			buttonsArr = [ buttons.close, buttons.cancel ];
		} else if ( inFinalStep ) {
			buttonsArr = [ buttons.close, buttons.prev, buttons.cancel ];
		} else {
			buttonsArr = this.state.surveyStep === 2
				? [ buttons.close, buttons.prev, buttons.next ]
				: [ buttons.close, buttons.next ];
		}

		return (
			<Dialog
				isVisible={ this.state.showDialog }
				buttons={ buttonsArr }
				onClose={ this.closeDialog }
				className="cancel-purchase__button-warning-dialog">
				<CancelPurchaseForm
					productName={ purchaseName }
					surveyStep={ this.state.surveyStep }
					showSurvey={ config.isEnabled( 'upgrades/removal-survey' ) }
					finalStep={ this.state.finalStep }
					defaultContent={ this.renderCancellationEffect() }
					onInputChange={ this.onSurveyChange }
					isJetpack={ isJetpackPlan( purchase ) }
				/>
			</Dialog>
		);
	}

	goToCancelConfirmation = () => {
		const { id } = this.props.purchase,
			{ slug } = this.props.selectedSite;

		page( paths.confirmCancelDomain( slug, id ) );
	}

	cancelPurchase = () => {
		const { purchase, translate } = this.props;

		this.toggleDisabled();

		cancelPurchase( purchase.id, ( success ) => {
			const purchaseName = getName( purchase ),
				subscriptionEndDate = getSubscriptionEndDate( purchase );

			this.props.refreshSitePlans( purchase.siteId );

			this.props.clearPurchases();

			if ( success ) {
				notices.success( translate(
					'%(purchaseName)s was successfully cancelled. It will be available ' +
					'for use until it expires on %(subscriptionEndDate)s.',
					{
						args: {
							purchaseName,
							subscriptionEndDate
						}
					}
				), { persistent: true } );

				page( paths.purchasesRoot() );
			} else {
				notices.error( translate(
					'There was a problem canceling %(purchaseName)s. ' +
					'Please try again later or contact support.',
					{
						args: { purchaseName }
					}
				) );
				this.cancellationFailed();
			}
		} );
	}

	cancellationFailed = () => {
		this.closeDialog();

		this.setState( {
			submitting: false
		} );
	}

	toggleDisabled = () => {
		this.setState( {
			disabled: ! this.state.disabled
		} );
	}

	handleSubmit = ( error, response ) => {
		if ( error ) {
			notices.error( error.message );

			this.cancellationFailed();

			return;
		}

		notices.success( response.message, { persistent: true } );

		this.props.refreshSitePlans( this.props.purchase.siteId );

		this.props.clearPurchases();

		this.recordEvent( 'calypso_purchases_cancel_form_submit' );

		page.redirect( paths.purchasesRoot() );
	}

	submitCancelAndRefundPurchase = () => {
		const { purchase, selectedSite } = this.props;
		const refundable = isRefundable( purchase );

		this.setState( {
			submitting: true
		} );

		if ( config.isEnabled( 'upgrades/removal-survey' ) ) {
			const surveyData = {
				'why-cancel': {
					response: this.state.survey.questionOneRadio,
					text: this.state.survey.questionOneText
				},
				'next-adventure': {
					response: this.state.survey.questionTwoRadio,
					text: this.state.survey.questionTwoText
				},
				'what-better': { text: this.state.survey.questionThreeText },
				type: refundable ? 'refund' : 'cancel-autorenew'
			};

			submitSurvey(
				'calypso-remove-purchase',
				this.props.selectedSite.ID,
				enrichedSurveyData( surveyData, moment(), selectedSite, purchase )
			);
		}

		if ( refundable ) {
			cancelAndRefundPurchase( purchase.id, { product_id: purchase.productId }, this.handleSubmit );
		} else {
			this.cancelPurchase();
		}
	}

	renderCancellationEffect = () => {
		const { purchase, translate } = this.props;

		return (
			<p>
				{ cancellationEffectHeadline( purchase, translate ) }
				{ cancellationEffectDetail( purchase, translate ) }
			</p>
		);
	}

	render() {
		const { purchase, translate } = this.props;

		let text, onClick;

		if ( isRefundable( purchase ) ) {
			onClick = this.handleCancelPurchaseClick;

			if ( isDomainRegistration( purchase ) ) {
				text = translate( 'Cancel Domain and Refund' );
			}

			if ( isSubscription( purchase ) ) {
				text = translate( 'Cancel Subscription and Refund' );
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
					disabled={ this.state.disabled }
					onClick={ onClick }
					primary>
					{ text }
				</Button>
				{ this.renderCancelConfirmationDialog() }
			</div>

		);
	}
}

export default connect(
	null,
	{
		clearPurchases,
		recordTracksEvent,
		refreshSitePlans,
	}
)( localize( CancelPurchaseButton ) );
