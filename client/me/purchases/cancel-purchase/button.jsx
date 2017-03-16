/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';
import { moment } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import config from 'config';
import Button from 'components/button';
import { cancelAndRefundPurchase, cancelPurchase, submitSurvey } from 'lib/upgrades/actions';
import { clearPurchases } from 'state/purchases/actions';
import { connect } from 'react-redux';
import Dialog from 'components/dialog';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import { getName, getSubscriptionEndDate, isOneTimePurchase, isRefundable, isSubscription } from 'lib/purchases';
import { enrichedSurveyData } from '../utils';
import { isDomainRegistration, isTheme, isGoogleApps, isJetpackPlan } from 'lib/products-values';
import notices from 'notices';
import paths from 'me/purchases/paths';
import { refreshSitePlans } from 'state/sites/plans/actions';
import FormSectionHeading from 'components/forms/form-section-heading';
import { recordTracksEvent } from 'state/analytics/actions';

const CancelPurchaseButton = React.createClass( {
	propTypes: {
		purchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			disabled: false,
			showDialog: false,
			isRemoving: false,
			surveyStep: 1,
			survey: {
				questionOneRadio: null,
				questionTwoRadio: null
			}
		};
	},

	recordEvent( name, properties = {} ) {
		const product_slug = get( this.props, 'purchase.productSlug' );
		const refund = true;
		this.props.recordTracksEvent(
			name,
			Object.assign( { refund, product_slug }, properties )
		);
	},

	handleCancelPurchaseClick() {
		if ( isDomainRegistration( this.props.purchase ) ) {
			return this.goToCancelConfirmation();
		}

		this.recordEvent( 'calypso_purchases_cancel_form_start' );

		this.setState( {
			showDialog: true
		} );
	},

	closeDialog() {
		this.recordEvent( 'calypso_purchases_cancel_form_close' );

		this.setState( {
			showDialog: false,
			surveyStep: 1,
			survey: {
				questionOneRadio: null,
				questionTwoRadio: null
			}
		} );
	},

	changeSurveyStep() {
		const newStep = this.state.surveyStep === 1 ? 2 : 1;

		this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: newStep } );

		this.setState( { surveyStep: newStep } );
	},

	onSurveyChange( update ) {
		this.setState( {
			survey: update,
		} );
	},

	isSurveyIncomplete() {
		return this.state.survey.questionOneRadio === null || this.state.survey.questionTwoRadio === null ||
			( this.state.survey.questionOneRadio === 'anotherReasonOne' && this.state.survey.questionOneText === '' ) ||
			( this.state.survey.questionTwoRadio === 'anotherReasonTwo' && this.state.survey.questionTwoText === '' );
	},

	renderCancelConfirmationDialog() {
		const buttons = {
				close: {
					action: 'close',
					label: this.translate( "No, I'll Keep It" )
				},
				next: {
					action: 'next',
					disabled: this.state.isRemoving || this.isSurveyIncomplete(),
					label: this.translate( 'Next' ),
					onClick: this.changeSurveyStep
				},
				prev: {
					action: 'prev',
					disabled: this.state.isRemoving,
					label: this.translate( 'Previous Step' ),
					onClick: this.changeSurveyStep
				},
				cancel: {
					action: 'cancel',
					label: this.translate( 'Yes, Cancel Now' ),
					isPrimary: true,
					disabled: this.state.submitting,
					onClick: this.submitCancelAndRefundPurchase
				}
			},
			purchaseName = getName( this.props.purchase ),
			inStepOne = this.state.surveyStep === 1;

		let buttonsArr;
		if ( ! config.isEnabled( 'upgrades/removal-survey' ) ) {
			buttonsArr = [ buttons.close, buttons.cancel ];
		} else {
			buttonsArr = inStepOne ? [ buttons.close, buttons.next ] : [ buttons.prev, buttons.close, buttons.cancel ];
		}

		return (
			<Dialog
				isVisible={ this.state.showDialog }
				buttons={ buttonsArr }
				onClose={ this.closeDialog }
				className="cancel-purchase__button-warning-dialog">
				<FormSectionHeading>{ this.translate( 'Cancel %(purchaseName)s', { args: { purchaseName } } ) }</FormSectionHeading>
				<CancelPurchaseForm
					surveyStep={ this.state.surveyStep }
					showSurvey={ config.isEnabled( 'upgrades/removal-survey' ) }
					defaultContent={ this.renderCancellationEffect() }
					onInputChange={ this.onSurveyChange }
				/>
			</Dialog>
		);
	},

	goToCancelConfirmation() {
		const { id } = this.props.purchase,
			{ slug } = this.props.selectedSite;

		page( paths.confirmCancelDomain( slug, id ) );
	},

	cancelPurchase() {
		const { purchase } = this.props;

		this.toggleDisabled();

		cancelPurchase( purchase.id, ( success ) => {
			const purchaseName = getName( purchase ),
				subscriptionEndDate = getSubscriptionEndDate( purchase );

			this.props.refreshSitePlans( purchase.siteId );

			this.props.clearPurchases();

			if ( success ) {
				notices.success( this.translate(
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
				notices.error( this.translate(
					'There was a problem canceling %(purchaseName)s. ' +
					'Please try again later or contact support.',
					{
						args: { purchaseName }
					}
				) );
				this.cancellationFailed();
			}
		} );
	},

	cancellationFailed() {
		this.closeDialog();

		this.setState( {
			submitting: false
		} );
	},

	toggleDisabled() {
		this.setState( {
			disabled: ! this.state.disabled
		} );
	},

	handleSubmit( error, response ) {
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
	},

	submitCancelAndRefundPurchase() {
		const { purchase, selectedSite } = this.props;

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
				type: 'refund'
			};

			submitSurvey(
				'calypso-remove-purchase',
				this.props.selectedSite.ID,
				enrichedSurveyData( surveyData, moment(), selectedSite, purchase )
			);
		}

		if ( isRefundable( purchase ) ) {
			cancelAndRefundPurchase( purchase.id, { product_id: purchase.productId }, this.handleSubmit );
		} else {
			this.cancelPurchase();
		}
	},

	renderCancellationEffect() {
		const { domain, refundText } = this.props.purchase,
			purchaseName = getName( this.props.purchase );

		let cancelationEffectText = this.translate(
			'All plan features and custom changes will be removed from your site and you will be refunded %(cost)s.', {
				args: {
					cost: refundText
				}
			}
		);

		if ( isTheme( this.props.purchase ) ) {
			cancelationEffectText = this.translate(
				'Your site\'s appearance will revert to its previously selected theme and you will be refunded %(cost)s.', {
					args: {
						cost: refundText
					}
				}
			);
		}

		if ( isGoogleApps( this.props.purchase ) ) {
			cancelationEffectText = this.translate(
				'You will be refunded %(cost)s, but your G Suite account will continue working without interruption. ' +
				'You will be able to manage your G Suite billing directly through Google.', {
					args: {
						cost: refundText
					}
				}
			);
		}

		if ( isJetpackPlan( this.props.purchase ) ) {
			cancelationEffectText = this.translate(
				'All plan features - spam filtering, backups, and security screening - will be removed from your site ' +
				'and you will be refunded %(cost)s.', {
					args: {
						cost: refundText
					}
				}
			);
		}

		return (
			<p>
				{ this.translate(
					'Are you sure you want to cancel and remove %(purchaseName)s from {{em}}%(domain)s{{/em}}? ', {
						args: {
							purchaseName,
							domain
						},
						components: {
							em: <em />
						}
					}
				) }
				{ cancelationEffectText }
			</p>
		);
	},

	render() {
		const { purchase } = this.props;

		let text, onClick;

		if ( isRefundable( purchase ) ) {
			onClick = this.handleCancelPurchaseClick;

			if ( isDomainRegistration( purchase ) ) {
				text = this.translate( 'Cancel Domain and Refund' );
			}

			if ( isSubscription( purchase ) ) {
				text = this.translate( 'Cancel Subscription and Refund' );
			}

			if ( isOneTimePurchase( purchase ) ) {
				text = this.translate( 'Cancel and Refund' );
			}
		} else {
			onClick = this.cancelPurchase;

			if ( isDomainRegistration( purchase ) ) {
				text = this.translate( 'Cancel Domain' );
			}

			if ( isSubscription( purchase ) ) {
				onClick = this.handleCancelPurchaseClick;
				text = this.translate( 'Cancel Subscription' );
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
} );

export default connect(
	null,
	{
		clearPurchases,
		recordTracksEvent,
		refreshSitePlans,
	}
)( CancelPurchaseButton );
