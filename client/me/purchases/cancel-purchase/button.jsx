import {
	isDomainRegistration,
	getMonthlyPlanByYearly,
	getPlan,
	isJetpackPlan,
	isJetpackProduct,
	isAkismetProduct,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CancelJetpackForm from 'calypso/components/marketing-survey/cancel-jetpack-form';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import DomainCancellationSurvey from 'calypso/components/marketing-survey/cancel-purchase-form/domain-cancellation-survey';
import {
	getName,
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	isSubscription,
} from 'calypso/lib/purchases';
import {
	cancelAndRefundPurchaseAsync,
	cancelAndRefundPurchase,
	cancelPurchaseAsync,
	extendPurchaseWithFreeMonth,
} from 'calypso/lib/purchases/actions';
import { getPurchaseCancellationFlowType } from 'calypso/lib/purchases/utils';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { getDowngradePlanFromPurchase } from 'calypso/state/purchases/selectors';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { MarketPlaceSubscriptionsDialog } from '../marketplace-subscriptions-dialog';
import { willShowDomainOptionsRadioButtons } from './domain-options';

class CancelPurchaseButton extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		purchaseListUrl: PropTypes.string,
		siteSlug: PropTypes.string.isRequired,
		cancelBundledDomain: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		disabled: PropTypes.bool,
		activeSubscriptions: PropTypes.array,
		onCancellationStart: PropTypes.func,
		onCancellationComplete: PropTypes.func,
		onSurveyComplete: PropTypes.func,
		moment: PropTypes.func,
		// Props from parent component
		showDialog: PropTypes.bool,
		cancellationCompleted: PropTypes.bool,
		cancellationMessage: PropTypes.string,
		isLoading: PropTypes.bool,
		onDialogClose: PropTypes.func,
		onSetLoading: PropTypes.func,
	};

	static defaultProps = {
		purchaseListUrl: purchasesRoot,
	};

	state = {
		disabled: false,
		isShowingMarketplaceSubscriptionsDialog: false,
	};

	setDisabled = ( disabled ) => {
		this.setState( { disabled } );
	};

	handleCancelPurchaseClick = async () => {
		// Handle domain cancellations immediately instead of redirecting to confirmation page
		if ( isDomainRegistration( this.props.purchase ) ) {
			// Set loading state using parent callback
			if ( this.props.onSetLoading ) {
				this.props.onSetLoading( true );
			}

			if ( this.props.onCancellationStart ) {
				this.props.onCancellationStart();
			}

			try {
				const result = await this.submitCancelAndRefundPurchase();
				if ( result.success ) {
					// Use parent state management instead of local state
					if ( this.props.onCancellationComplete ) {
						this.props.onCancellationComplete( result.message );
					}
				} else {
					this.cancellationFailed( result.error );
				}
			} catch ( error ) {
				this.cancellationFailed( error.message );
			}
			return;
		}

		// For other purchases, determine if we need domain options step
		// If onCancellationStart is null, we're already in the domain options step
		if ( this.props.onCancellationStart === null ) {
			// We're in the domain options step, perform cancellation directly
			await this.performCancellation();
		} else {
			const needsDomainOptionsStep =
				this.props.includedDomainPurchase &&
				willShowDomainOptionsRadioButtons( this.props.includedDomainPurchase, this.props.purchase );

			if ( needsDomainOptionsStep ) {
				// Step 1: Show domain options step
				this.props.onCancellationStart();
			} else {
				// Step 2: Perform cancellation immediately
				await this.performCancellation();
			}
		}
	};

	closeDialog = () => {
		this.setState( {
			isShowingMarketplaceSubscriptionsDialog: false,
		} );

		// Call parent's dialog close handler if provided
		if ( this.props.onDialogClose ) {
			this.props.onDialogClose();
		}

		// Always redirect to purchases page when dialog is closed
		page.redirect( this.props.purchaseListUrl );
	};

	cancelPurchase = async ( purchase ) => {
		const { translate } = this.props;

		try {
			const success = await cancelPurchaseAsync( purchase.id );

			if ( success ) {
				const purchaseName = getName( purchase );
				const subscriptionEndDate = this.props.moment( purchase.expiryDate ).format( 'LL' );

				return {
					success: true,
					message: translate(
						'%(purchaseName)s was successfully cancelled. It will be available for use until it expires on %(subscriptionEndDate)s.',
						{
							args: {
								purchaseName,
								subscriptionEndDate,
							},
						}
					),
				};
			}

			return {
				success: false,
				error: translate(
					'There was a problem canceling %(purchaseName)s. ' +
						'Please try again later or contact support.',
					{
						args: { purchaseName: getName( purchase ) },
					}
				),
			};
		} catch ( error ) {
			return {
				success: false,
				error: translate(
					'There was a problem canceling %(purchaseName)s. ' +
						'Please try again later or contact support.',
					{
						args: { purchaseName: getName( purchase ) },
					}
				),
			};
		}
	};

	cancelAndRefund = async ( purchase ) => {
		const { cancelBundledDomain, translate } = this.props;

		try {
			await cancelAndRefundPurchaseAsync( purchase.id, {
				product_id: purchase.productId,
				cancel_bundled_domain: cancelBundledDomain ? 1 : 0,
			} );

			return {
				success: true,
				message: translate( 'Your refund has been processed and your purchase removed.' ),
			};
		} catch ( error ) {
			return { success: false, error: error.message };
		}
	};

	downgradeClick = ( upsell ) => {
		const { purchase } = this.props;
		let downgradePlan = getDowngradePlanFromPurchase( purchase );
		if ( 'downgrade-monthly' === upsell ) {
			const monthlyProductSlug = getMonthlyPlanByYearly( purchase.productSlug );
			downgradePlan = getPlan( monthlyProductSlug );
		}

		this.setDisabled( true );

		cancelAndRefundPurchase(
			purchase.id,
			{
				product_id: purchase.productId,
				type: 'downgrade',
				to_product_id: downgradePlan.getProductId(),
			},
			( error, response ) => {
				this.setDisabled( false );

				if ( error ) {
					this.cancellationFailed( error.message );
					return;
				}

				this.props.refreshSitePlans( purchase.siteId );
				this.props.clearPurchases();
				this.props.successNotice( response.message, { displayOnNextPage: true } );
				page.redirect( this.props.purchaseListUrl );
			}
		);
	};

	freeMonthOfferClick = async () => {
		const { purchase } = this.props;

		this.setDisabled( true );

		try {
			const res = await extendPurchaseWithFreeMonth( purchase.id );
			if ( res.status === 'completed' ) {
				this.props.refreshSitePlans( purchase.siteId );
				this.props.clearPurchases();
				this.props.successNotice( res.message, { displayOnNextPage: true } );
				page.redirect( this.props.purchaseListUrl );
			}
		} catch ( err ) {
			this.cancellationFailed( err.message );
		} finally {
			this.setDisabled( false );
		}
	};

	shouldHandleMarketplaceSubscriptions() {
		const { activeSubscriptions } = this.props;

		return activeSubscriptions?.length > 0;
	}

	showMarketplaceDialog = () => {
		this.setState( {
			isShowingMarketplaceSubscriptionsDialog: true,
		} );
	};

	submitCancelAndRefundPurchase = async () => {
		const { purchase } = this.props;
		const refundable = hasAmountAvailableToRefund( purchase );

		if ( refundable ) {
			return await this.cancelAndRefund( purchase );
		}
		return await this.cancelPurchase( purchase );
	};

	handleMarketplaceSubscriptions = async ( isPlanRefundable ) => {
		if ( this.shouldHandleMarketplaceSubscriptions() ) {
			return Promise.all(
				this.props.activeSubscriptions.map( async ( s ) => {
					if ( isPlanRefundable && hasAmountAvailableToRefund( s ) ) {
						await this.cancelAndRefund( s );
					} else {
						await this.cancelPurchase( s );
					}
				} )
			);
		}
	};

	handleSurveyComplete = () => {
		// Handle success flow after survey completion
		if ( this.props.cancellationCompleted ) {
			this.props.refreshSitePlans( this.props.purchase.siteId );
			this.props.clearPurchases();

			// Show success notice after survey completion using the API response message
			if ( this.props.cancellationMessage ) {
				this.props.successNotice( this.props.cancellationMessage, {
					displayOnNextPage: true,
					duration: 10000,
				} );
			}
		}

		// Close dialog and redirect after handling the completion
		this.closeDialog();
	};

	performCancellation = async () => {
		const { purchase, onCancellationComplete, onCancellationStart, onSetLoading } = this.props;

		// Set loading state if callback is provided
		if ( onSetLoading ) {
			onSetLoading( true );
		}

		// Notify parent that cancellation is starting (for loading state)
		// Only call if onCancellationStart is provided and not null
		if ( onCancellationStart ) {
			onCancellationStart();
		}

		try {
			const result = await this.submitCancelAndRefundPurchase();

			if ( result.success ) {
				// Handle marketplace subscriptions if any
				const refundable = hasAmountAvailableToRefund( purchase );
				await this.handleMarketplaceSubscriptions( refundable );

				// Always call the callback to notify the parent component
				if ( onCancellationComplete ) {
					onCancellationComplete( result.message );
				}
			} else {
				this.cancellationFailed( result.error );
			}
		} catch ( error ) {
			this.cancellationFailed( error.message );
		}
	};

	cancellationFailed = ( errorMessage ) => {
		// Reset loading state using parent callback
		if ( this.props.onSetLoading ) {
			this.props.onSetLoading( false );
		}

		if ( this.props.onSurveyComplete ) {
			this.props.onSurveyComplete();
		}

		this.props.errorNotice( errorMessage );
	};

	render() {
		const { purchase, translate, cancelBundledDomain, includedDomainPurchase } = this.props;

		const onClick = ( () => {
			return this.handleCancelPurchaseClick;
		} )();

		const text = ( () => {
			if ( hasAmountAvailableToRefund( purchase ) ) {
				if ( isDomainRegistration( purchase ) ) {
					return translate( 'Cancel domain and refund' );
				}
				if ( isSubscription( purchase ) ) {
					return translate( 'Cancel subscription' );
				}
				if ( isOneTimePurchase( purchase ) ) {
					return translate( 'Cancel and refund' );
				}
			}

			if ( isDomainRegistration( purchase ) ) {
				return translate( 'Cancel domain' );
			}

			if ( isSubscription( purchase ) ) {
				return translate( 'Cancel subscription' );
			}
		} )();

		const disableButtons = this.state.disabled || this.props.disabled;
		const {
			isJetpack,
			isAkismet,
			purchaseListUrl,
			activeSubscriptions,
			isLoading,
			showDialog,
			cancellationCompleted,
			cancellationMessage,
		} = this.props;

		const planName = getName( purchase );

		return (
			<div className="cancel-purchase__button-wrapper">
				<Button
					className="cancel-purchase__button"
					disabled={ disableButtons }
					busy={ isLoading }
					scary
					onClick={
						this.shouldHandleMarketplaceSubscriptions() ? this.showMarketplaceDialog : onClick
					}
					primary
				>
					{ text }
				</Button>

				{ ! isJetpack && ! isAkismet && ! isDomainRegistration( purchase ) && (
					<CancelPurchaseForm
						disableButtons={ disableButtons }
						purchase={ purchase }
						isVisible={ showDialog }
						onClose={ this.closeDialog }
						onSurveyComplete={ this.handleSurveyComplete }
						downgradeClick={ this.downgradeClick }
						freeMonthOfferClick={ this.freeMonthOfferClick }
						flowType={ getPurchaseCancellationFlowType( purchase ) }
						cancelBundledDomain={ cancelBundledDomain }
						includedDomainPurchase={ includedDomainPurchase }
						cancellationCompleted={ cancellationCompleted }
						cancellationMessage={ cancellationMessage }
						cancellationInProgress={ isLoading }
					/>
				) }

				{ ( isJetpack || isAkismet ) && (
					<CancelJetpackForm
						disableButtons={ disableButtons }
						purchase={ purchase }
						purchaseListUrl={ purchaseListUrl }
						isVisible={ showDialog }
						onClose={ this.closeDialog }
						onSurveyComplete={ this.handleSurveyComplete }
						flowType={ getPurchaseCancellationFlowType( purchase ) }
						isAkismet={ isAkismet }
						cancellationCompleted={ cancellationCompleted }
						cancellationMessage={ cancellationMessage }
						cancellationInProgress={ isLoading }
					/>
				) }

				{ isDomainRegistration( purchase ) && (
					<DomainCancellationSurvey
						disableButtons={ disableButtons }
						purchase={ purchase }
						purchaseListUrl={ purchaseListUrl }
						isVisible={ showDialog }
						onClose={ this.closeDialog }
						onSurveyComplete={ this.handleSurveyComplete }
						cancellationCompleted={ cancellationCompleted }
						cancellationMessage={ cancellationMessage }
						cancellationInProgress={ isLoading }
					/>
				) }

				{ this.shouldHandleMarketplaceSubscriptions() && (
					<MarketPlaceSubscriptionsDialog
						isDialogVisible={ this.state.isShowingMarketplaceSubscriptionsDialog }
						closeDialog={ this.closeDialog }
						removePlan={ this.handleSurveyComplete }
						planName={ planName }
						activeSubscriptions={ activeSubscriptions }
						sectionHeadingText={ translate( 'Cancel %(plan)s', {
							args: { plan: planName },
						} ) }
						primaryButtonText={ translate( 'Continue', {
							comment:
								'This button cancels the active plan and all active Marketplace subscriptions on the site',
						} ) }
						bodyParagraphText={ translate(
							'This subscription will be cancelled. It will be removed when it expires.',
							'These subscriptions will be cancelled. They will be removed when they expire.',
							{ count: activeSubscriptions.length }
						) }
					/>
				) }
			</div>
		);
	}
}

export default connect(
	( state, { purchase } ) => ( {
		isJetpack: purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) ),
		isAkismet: purchase && isAkismetProduct( purchase ),
	} ),
	{
		clearPurchases,
		errorNotice,
		successNotice,
		refreshSitePlans,
	}
)( localize( CancelPurchaseButton ) );
