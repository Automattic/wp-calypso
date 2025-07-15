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
	cancelAndRefundPurchase,
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
		// For all purchases, including domain registrations, show the survey first
		// The API call will happen at the end of the survey flow

		// For other purchases, determine if we need domain options step
		// If onCancellationStart is null, we're already in the domain options step
		if ( this.props.onCancellationStart === null ) {
			// We're in the domain options step, show survey directly
			this.props.onCancellationStart();
		} else {
			const needsDomainOptionsStep =
				this.props.includedDomainPurchase &&
				willShowDomainOptionsRadioButtons( this.props.includedDomainPurchase, this.props.purchase );

			if ( needsDomainOptionsStep ) {
				// Step 1: Show domain options step
				this.props.onCancellationStart();
			} else {
				// Step 2: Show survey directly (API call will happen in survey)
				this.props.onCancellationStart();
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
					this.props.errorNotice( error.message );
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
			this.props.errorNotice( err.message );
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
		const { isJetpack, isAkismet, purchaseListUrl, activeSubscriptions, isLoading, showDialog } =
			this.props;

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
