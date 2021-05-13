/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { getCurrencyDefaults } from '@automattic/format-currency';

/**
 * Internal Dependencies
 */
import { Button } from '@automattic/components';
import { cancelAndRefundPurchase, cancelPurchase } from 'calypso/lib/purchases/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import {
	getName,
	getSubscriptionEndDate,
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	isSubscription,
} from 'calypso/lib/purchases';
import { isDomainRegistration } from '@automattic/calypso-products';
import { confirmCancelDomain, purchasesRoot } from 'calypso/me/purchases/paths';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { cancellationEffectDetail, cancellationEffectHeadline } from './cancellation-effect';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getDowngradePlanFromPurchase } from 'calypso/state/purchases/selectors';

class CancelPurchaseButton extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		purchaseListUrl: PropTypes.string,
		getConfirmCancelDomainUrlFor: PropTypes.func,
		selectedSite: PropTypes.object,
		siteSlug: PropTypes.string.isRequired,
		cancelBundledDomain: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		purchaseListUrl: purchasesRoot,
		getConfirmCancelDomainUrlFor: confirmCancelDomain,
	};

	state = {
		disabled: false,
		showDialog: false,
		survey: {},
	};

	getCancellationFlowType = () => {
		return hasAmountAvailableToRefund( this.props.purchase )
			? CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND
			: CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
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
		} );
	};

	onSurveyChange = ( update ) => {
		this.setState( {
			survey: update,
		} );
	};

	goToCancelConfirmation = () => {
		const { id } = this.props.purchase;
		const slug = this.props.siteSlug;

		page( this.props.getConfirmCancelDomainUrlFor( slug, id ) );
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

	cancelAndRefund = () => {
		const { purchase, cancelBundledDomain } = this.props;

		this.setDisabled( true );

		cancelAndRefundPurchase(
			purchase.id,
			{ product_id: purchase.productId, cancel_bundled_domain: cancelBundledDomain ? 1 : 0 },
			( error, response ) => {
				this.setDisabled( false );

				if ( error ) {
					this.props.errorNotice( error.message );

					this.cancellationFailed();

					return;
				}

				this.props.successNotice( response.message, { displayOnNextPage: true } );

				this.props.refreshSitePlans( purchase.siteId );

				this.props.clearPurchases();

				page.redirect( this.props.purchaseListUrl );
			}
		);
	};

	downgradeClick = () => {
		const { purchase } = this.props;
		const downgradePlan = getDowngradePlanFromPurchase( purchase );

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

				this.props.successNotice( response.message, { displayOnNextPage: true } );

				this.props.refreshSitePlans( purchase.siteId );

				this.props.clearPurchases();

				page.redirect( this.props.purchaseListUrl );
			}
		);
	};

	submitCancelAndRefundPurchase = () => {
		const refundable = hasAmountAvailableToRefund( this.props.purchase );

		if ( refundable ) {
			this.cancelAndRefund();
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
				<CancelPurchaseForm
					disableButtons={ disableButtons }
					defaultContent={ this.renderCancellationEffect() }
					onInputChange={ this.onSurveyChange }
					purchase={ purchase }
					selectedSite={ selectedSite }
					isVisible={ this.state.showDialog }
					onClose={ this.closeDialog }
					onClickFinalConfirm={ this.submitCancelAndRefundPurchase }
					downgradeClick={ this.downgradeClick }
					flowType={ this.getCancellationFlowType() }
				/>
			</div>
		);
	}
}

export default connect( null, {
	clearPurchases,
	errorNotice,
	successNotice,
	refreshSitePlans,
} )( localize( CancelPurchaseButton ) );
