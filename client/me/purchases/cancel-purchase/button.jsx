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
import {
	getName,
	getSubscriptionEndDate,
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	isRefundable,
	isSubscription,
} from 'calypso/lib/purchases';
import {
	cancelAndRefundPurchaseAsync,
	cancelAndRefundPurchase,
	cancelPurchaseAsync,
	extendPurchaseWithFreeMonth,
} from 'calypso/lib/purchases/actions';
import { getPurchaseCancellationFlowType } from 'calypso/lib/purchases/utils';
import { confirmCancelDomain, purchasesRoot } from 'calypso/me/purchases/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { getDowngradePlanFromPurchase } from 'calypso/state/purchases/selectors';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { MarketPlaceSubscriptionsDialog } from '../marketplace-subscriptions-dialog';

class CancelPurchaseButton extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		purchaseListUrl: PropTypes.string,
		getConfirmCancelDomainUrlFor: PropTypes.func,
		siteSlug: PropTypes.string.isRequired,
		cancelBundledDomain: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		disabled: PropTypes.bool,
		activeSubscriptions: PropTypes.array,
	};

	static defaultProps = {
		purchaseListUrl: purchasesRoot,
		getConfirmCancelDomainUrlFor: confirmCancelDomain,
	};

	state = {
		disabled: false,
		showDialog: false,
		isShowingMarketplaceSubscriptionsDialog: false,
	};

	handleCancelPurchaseClick = () => {
		if ( isDomainRegistration( this.props.purchase ) ) {
			return this.goToCancelConfirmation();
		}

		this.setState( {
			showDialog: true,
		} );
	};

	closeDialog = () => {
		this.setState( {
			showDialog: false,
			isShowingMarketplaceSubscriptionsDialog: false,
		} );
	};

	goToCancelConfirmation = () => {
		const { id } = this.props.purchase;
		const slug = this.props.siteSlug;

		page( this.props.getConfirmCancelDomainUrlFor( slug, id ) );
	};

	cancelPurchase = async ( purchase ) => {
		const { translate } = this.props;

		this.setDisabled( true );
		let success;
		try {
			success = await cancelPurchaseAsync( purchase.id );
		} catch {
			success = false;
		}
		const purchaseName = getName( purchase );
		const subscriptionEndDate = getSubscriptionEndDate( purchase );

		this.props.refreshSitePlans( purchase.siteId );

		this.props.clearPurchases();

		if ( success ) {
			this.props.successNotice(
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
				{ displayOnNextPage: true }
			);

			page( this.props.purchaseListUrl );
		} else {
			this.props.errorNotice(
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
	};

	cancellationFailed = () => {
		this.closeDialog();
		this.setDisabled( false );
	};

	setDisabled = ( disabled ) => {
		this.setState( { disabled } );
	};

	handleSubmit = ( error, response ) => {
		if ( error ) {
			this.props.errorNotice( error.message );

			this.cancellationFailed();

			return;
		}

		this.props.successNotice( response.message, { displayOnNextPage: true } );

		this.props.refreshSitePlans( this.props.purchase.siteId );

		this.props.clearPurchases();

		page.redirect( this.props.purchaseListUrl );
	};

	cancelAndRefund = async ( purchase ) => {
		const { cancelBundledDomain } = this.props;

		this.setDisabled( true );

		try {
			const response = await cancelAndRefundPurchaseAsync( purchase.id, {
				product_id: purchase.productId,
				cancel_bundled_domain: cancelBundledDomain ? 1 : 0,
			} );

			this.props.refreshSitePlans( purchase.siteId );
			this.props.clearPurchases();
			this.props.successNotice( response.message, { displayOnNextPage: true } );
			page.redirect( this.props.purchaseListUrl );
		} catch ( error ) {
			this.props.errorNotice( error.message );
			this.cancellationFailed();
		} finally {
			this.setDisabled( false );
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
					this.props.errorNotice( error.message );
					this.cancellationFailed();
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
				this.props.successNotice( res.message, { displayOnNextPage: true } );
				page.redirect( this.props.purchaseListUrl );
			}
		} catch ( err ) {
			this.props.errorNotice( err.message );
			this.cancellationFailed();
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
			this.cancelAndRefund( purchase );
		} else {
			this.cancelPurchase( purchase );
		}
		await this.handleMarketplaceSubscriptions( refundable );
	};

	handleMarketplaceSubscriptions = async ( isPlanRefundable ) => {
		// If the site has active Marketplace subscriptions, remove these as well
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

	render() {
		const { purchase, translate, cancelBundledDomain, includedDomainPurchase } = this.props;

		const onClick = ( () => {
			if ( hasAmountAvailableToRefund( purchase ) ) {
				if (
					isDomainRegistration( purchase ) ||
					isSubscription( purchase ) ||
					isOneTimePurchase( purchase )
				) {
					return this.handleCancelPurchaseClick;
				}
			} else {
				if ( isDomainRegistration( purchase ) && isRefundable( purchase ) ) {
					// Domain in AGP bought with domain credits should be canceled immediately
					return this.handleCancelPurchaseClick;
				}

				if ( isSubscription( purchase ) ) {
					return this.handleCancelPurchaseClick;
				}

				return () => {
					this.cancelPurchase( purchase );
				};
			}
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
			} else {
				if ( isDomainRegistration( purchase ) ) {
					return translate( 'Cancel domain' );
				}

				if ( isSubscription( purchase ) ) {
					return translate( 'Cancel subscription' );
				}
			}
		} )();

		const disableButtons = this.state.disabled || this.props.disabled;
		const { isJetpack, isAkismet, purchaseListUrl, activeSubscriptions } = this.props;
		const closeDialogAndProceed = () => {
			this.closeDialog();
			return onClick();
		};

		const planName = getName( purchase );

		return (
			<div className="cancel-purchase__button-wrapper">
				<Button
					className="cancel-purchase__button"
					disabled={ disableButtons }
					onClick={
						this.shouldHandleMarketplaceSubscriptions() ? this.showMarketplaceDialog : onClick
					}
					primary
				>
					{ text }
				</Button>

				{ ! isJetpack && (
					<CancelPurchaseForm
						disableButtons={ disableButtons }
						purchase={ purchase }
						isVisible={ this.state.showDialog }
						onClose={ this.closeDialog }
						onClickFinalConfirm={ this.submitCancelAndRefundPurchase }
						downgradeClick={ this.downgradeClick }
						freeMonthOfferClick={ this.freeMonthOfferClick }
						flowType={ getPurchaseCancellationFlowType( purchase ) }
						cancelBundledDomain={ cancelBundledDomain }
						includedDomainPurchase={ includedDomainPurchase }
					/>
				) }

				{ ( isJetpack || isAkismet ) && (
					<CancelJetpackForm
						disableButtons={ disableButtons }
						purchase={ purchase }
						purchaseListUrl={ purchaseListUrl }
						isVisible={ this.state.showDialog }
						onClose={ this.closeDialog }
						onClickFinalConfirm={ this.submitCancelAndRefundPurchase }
						flowType={ getPurchaseCancellationFlowType( purchase ) }
						isAkismet={ isAkismet }
					/>
				) }

				{ this.shouldHandleMarketplaceSubscriptions() && (
					<MarketPlaceSubscriptionsDialog
						isDialogVisible={ this.state.isShowingMarketplaceSubscriptionsDialog }
						closeDialog={ this.closeDialog }
						removePlan={ closeDialogAndProceed }
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
