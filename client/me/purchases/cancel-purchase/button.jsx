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
import { cancelAndRefundPurchase, cancelPurchase } from 'lib/purchases/actions';
import { clearPurchases } from 'state/purchases/actions';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import { CANCEL_FLOW_TYPE } from 'components/marketing-survey/cancel-purchase-form/constants';
import {
	getName,
	getSubscriptionEndDate,
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	isSubscription,
} from 'lib/purchases';
import { isDomainRegistration } from 'lib/products-values';
import notices from 'notices';
import { confirmCancelDomain, purchasesRoot } from 'me/purchases/paths';
import { refreshSitePlans } from 'state/sites/plans/actions';
import { cancellationEffectDetail, cancellationEffectHeadline } from './cancellation-effect';
import { getDowngradePlanFromPurchase } from 'state/purchases/selectors';

class CancelPurchaseButton extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		siteSlug: PropTypes.string.isRequired,
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
		const { id } = this.props.purchase,
			slug = this.props.siteSlug;

		page( confirmCancelDomain( slug, id ) );
	};

	cancelPurchase = () => {
		const { purchase, translate } = this.props;

		this.setDisabled( true );

		cancelPurchase( purchase.id, ( success ) => {
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
		this.setDisabled( false );
	};

	setDisabled = ( disabled ) => {
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

	cancelAndRefund = () => {
		const { purchase, cancelBundledDomain } = this.props;

		this.setDisabled( true );

		cancelAndRefundPurchase(
			purchase.id,
			{ product_id: purchase.productId, cancel_bundled_domain: cancelBundledDomain ? 1 : 0 },
			( error, response ) => {
				this.setDisabled( false );

				if ( error ) {
					notices.error( error.message );

					this.cancellationFailed();

					return;
				}

				notices.success( response.message, { persistent: true } );

				this.props.refreshSitePlans( purchase.siteId );

				this.props.clearPurchases();

				page.redirect( purchasesRoot );
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
					notices.error( error.message );

					this.cancellationFailed();

					return;
				}

				notices.success( response.message, { persistent: true } );

				this.props.refreshSitePlans( purchase.siteId );

				this.props.clearPurchases();

				page.redirect( purchasesRoot );
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
		let text, onClick;

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
	refreshSitePlans,
} )( localize( CancelPurchaseButton ) );
