import {
	isDomainRegistration,
	getMonthlyPlanByYearly,
	getPlan,
	isJetpackPlan,
	isJetpackProduct,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { getCurrencyDefaults } from '@automattic/format-currency';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CancelJetpackForm from 'calypso/components/marketing-survey/cancel-jetpack-form';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	getName,
	getSubscriptionEndDate,
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	isSubscription,
} from 'calypso/lib/purchases';
import {
	cancelAndRefundPurchase,
	cancelPurchase,
	extendPurchaseWithFreeMonth,
} from 'calypso/lib/purchases/actions';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { getDowngradePlanFromPurchase } from 'calypso/state/purchases/selectors';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import { receiveDeletedSite } from 'calypso/state/sites/actions';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { cancellationEffectDetail, cancellationEffectHeadline } from './cancellation-effect';

class CancelPurchaseButton extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		purchaseListUrl: PropTypes.string,
		siteSlug: PropTypes.string.isRequired,
		cancelBundledDomain: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		purchaseListUrl: purchasesRoot,
	};

	state = {
		disabled: false,
		showDialog: false,
	};

	getCancellationFlowType = () => {
		return hasAmountAvailableToRefund( this.props.purchase )
			? CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND
			: CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
	};

	handleCancelPurchaseClick = () => {
		this.setState( {
			showDialog: true,
		} );
	};

	closeDialog = () => {
		this.setState( {
			showDialog: false,
		} );
	};

	cancelPurchase = () => {
		const { purchase, translate } = this.props;

		this.setDisabled( true );

		cancelPurchase( purchase.id, ( success ) => {
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
		} );
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

	cancelAndRefund = ( data ) => {
		const { isDomainOnlySite, purchase, cancelBundledDomain } = this.props;

		this.setDisabled( true );

		if ( ! data ) {
			data = { product_id: purchase.productId, cancel_bundled_domain: cancelBundledDomain ? 1 : 0 };
		}

		cancelAndRefundPurchase( purchase.id, data, ( error, response ) => {
			this.setDisabled( false );

			if ( isDomainOnlySite ) {
				this.props.receiveDeletedSite( purchase.siteId );
				this.props.setAllSitesSelected();
			}

			if ( error ) {
				this.props.errorNotice( error.message );
				this.cancellationFailed();
				return;
			}

			this.props.refreshSitePlans( purchase.siteId );
			this.props.clearPurchases();

			if ( isDomainRegistration( purchase ) ) {
				recordTracksEvent( 'calypso_domain_cancel_form_submit', {
					product_slug: purchase.productSlug,
				} );
			}

			this.props.successNotice( response.message, { displayOnNextPage: true } );
			page.redirect( this.props.purchaseListUrl );
		} );
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

	submitCancelAndRefundPurchase = ( data ) => {
		const refundable = hasAmountAvailableToRefund( this.props.purchase );

		if ( refundable ) {
			this.cancelAndRefund( data );
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
		const { purchase, translate, cancelBundledDomain, includedDomainPurchase } = this.props;
		let text;
		let onClick;

		if ( hasAmountAvailableToRefund( purchase ) ) {
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

		const disableButtons = this.state.disabled || this.props.disabled;
		const { isJetpack } = this.props;

		return (
			<div>
				<Button
					className="cancel-purchase__button"
					disabled={ disableButtons }
					onClick={ onClick }
					primary
				>
					{ text }
				</Button>

				{ ! isJetpack && (
					<CancelPurchaseForm
						disableButtons={ disableButtons }
						defaultContent={ this.renderCancellationEffect() }
						purchase={ purchase }
						isVisible={ this.state.showDialog }
						onClose={ this.closeDialog }
						onClickFinalConfirm={ this.submitCancelAndRefundPurchase }
						downgradeClick={ this.downgradeClick }
						freeMonthOfferClick={ this.freeMonthOfferClick }
						flowType={ this.getCancellationFlowType() }
						cancelBundledDomain={ cancelBundledDomain }
						includedDomainPurchase={ includedDomainPurchase }
					/>
				) }

				{ isJetpack && (
					<CancelJetpackForm
						disableButtons={ disableButtons }
						purchase={ purchase }
						isVisible={ this.state.showDialog }
						onClose={ this.closeDialog }
						onClickFinalConfirm={ this.submitCancelAndRefundPurchase }
						flowType={ this.getCancellationFlowType() }
					/>
				) }
			</div>
		);
	}
}

export default connect(
	( state, { purchase } ) => ( {
		isJetpack: purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) ),
		isDomainOnlySite: isDomainOnly( state, purchase.siteId ),
	} ),
	{
		clearPurchases,
		errorNotice,
		successNotice,
		refreshSitePlans,
		receiveDeletedSite,
		setAllSitesSelected,
	}
)( localize( CancelPurchaseButton ) );
