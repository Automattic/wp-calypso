/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import config from 'config';
import analytics from 'lib/analytics';
import Button from 'components/button';
import { cancelAndRefundPurchase, cancelPurchase, submitSurvey } from 'lib/upgrades/actions';
import { clearPurchases } from 'state/purchases/actions';
import { connect } from 'react-redux';
import Dialog from 'components/dialog';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import { getName, getSubscriptionEndDate, isOneTimePurchase, isRefundable, isSubscription } from 'lib/purchases';
import { isDomainRegistration, isTheme, isGoogleApps } from 'lib/products-values';
import notices from 'notices';
import paths from 'me/purchases/paths';
import { refreshSitePlans } from 'state/sites/plans/actions';
import FormSectionHeading from 'components/forms/form-section-heading';

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

	handleCancelPurchaseClick() {
		if ( isDomainRegistration( this.props.purchase ) ) {
			return this.goToCancelConfirmation();
		}

		this.setState( {
			showDialog: true
		} );
	},

	closeDialog() {
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
		this.setState( {
			surveyStep: this.state.surveyStep === 1 ? 2 : 1,
		} );
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

				page( paths.list() );
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

		analytics.tracks.recordEvent(
			'calypso_purchases_cancel_form_submit',
			{ product_slug: this.props.purchase.productSlug }
		);

		page.redirect( paths.list() );
	},

	submitCancelAndRefundPurchase() {
		this.setState( {
			submitting: true
		} );

		if ( config.isEnabled( 'upgrades/removal-survey' ) ) {
			const { purchase } = this.props,
				surveyData = {
					'why-cancel': {
						response: this.state.survey.questionOneRadio,
						text: this.state.survey.questionOneText
					},
					'next-adventure': {
						response: this.state.survey.questionTwoRadio,
						text: this.state.survey.questionTwoText
					},
					'what-better': { text: this.state.survey.questionThreeText },
					purchase: purchase.productSlug,
					type: 'refund'
				};

			submitSurvey( 'calypso-remove-purchase', this.props.selectedSite.ID, surveyData );
		}

		cancelAndRefundPurchase( this.props.purchase.id, { product_id: this.props.purchase.productId }, this.handleSubmit );
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
				'You will be refunded %(cost)s, but your Google Apps account will continue working without interruption. ' +
				'You will be able to manage your Google Apps billing directly through Google.', {
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
		refreshSitePlans
	}
)( CancelPurchaseButton );
