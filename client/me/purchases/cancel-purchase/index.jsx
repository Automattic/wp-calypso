import {
	isDomainRegistration,
	isDomainTransfer,
	isPlan,
	hasMarketplaceProduct,
	isJetpackPlan,
	isJetpackProduct,
	getPlan,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card, CompactCard } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import BackupRetentionOptionOnCancelPurchase from 'calypso/components/backup-retention-management/retention-option-on-cancel-purchase';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getName,
	purchaseType,
	hasAmountAvailableToRefund,
	canAutoRenewBeTurnedOff,
	isOneTimePurchase,
	isRefundable,
	isSubscription,
} from 'calypso/lib/purchases';
import CancelPurchaseLoadingPlaceholder from 'calypso/me/purchases/cancel-purchase/loading-placeholder';
import { managePurchase, purchasesRoot } from 'calypso/me/purchases/paths';
import ProductLink from 'calypso/me/purchases/product-link';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { isDataLoading } from 'calypso/me/purchases/utils';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	getByPurchaseId,
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
	getIncludedDomainPurchase,
} from 'calypso/state/purchases/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import SupportLink from '../cancel-purchase-support-link/support-link';
import CancelPurchaseButton from './button';
import CancelPurchaseDomainOptions from './domain-options';
import CancelPurchaseFeatureList from './feature-list';
import CancelPurchaseRefundInformation from './refund-information';

import './style.scss';

class CancelPurchase extends Component {
	static propTypes = {
		purchaseListUrl: PropTypes.string,
		getManagePurchaseUrlFor: PropTypes.func,
		getConfirmCancelDomainUrlFor: PropTypes.func,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		isJetpackPurchase: PropTypes.bool,
		purchase: PropTypes.object,
		purchaseId: PropTypes.number.isRequired,
		site: PropTypes.object,
		siteSlug: PropTypes.string.isRequired,
	};

	state = {
		cancelBundledDomain: false,
		confirmCancelBundledDomain: false,
	};

	static defaultProps = {
		getManagePurchaseUrlFor: managePurchase,
		purchaseListUrl: purchasesRoot,
	};

	componentDidMount() {
		if ( ! this.isDataValid() ) {
			this.redirect();
			return;
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.isDataValid( prevProps ) && ! this.isDataValid() ) {
			this.redirect();
			return;
		}
	}

	isDataValid = ( props = this.props ) => {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const { purchase } = props;

		if ( ! purchase ) {
			return false;
		}

		// For domain transfers, we only allow cancel if it's also refundable
		const isDomainTransferCancelable = isRefundable( purchase ) || ! isDomainTransfer( purchase );

		return canAutoRenewBeTurnedOff( purchase ) && isDomainTransferCancelable;
	};

	redirect = () => {
		const { purchase, siteSlug } = this.props;
		let redirectPath = this.props.purchaseListUrl;

		if (
			siteSlug &&
			purchase &&
			( ! canAutoRenewBeTurnedOff( purchase ) || isDomainTransfer( purchase ) )
		) {
			redirectPath = this.props.getManagePurchaseUrlFor( siteSlug, purchase.id );
		}

		page.redirect( redirectPath );
	};

	onCancelConfirmationStateChange = ( newState ) => {
		this.setState( newState );
	};

	getActiveMarketplaceSubscriptions() {
		const { purchase, purchases, productsList } = this.props;

		if ( ! isPlan( purchase ) ) {
			return [];
		}

		return purchases.filter(
			( _purchase ) =>
				_purchase.active && hasMarketplaceProduct( productsList, _purchase.productSlug )
		);
	}

	renderExpirationText = () => {
		const { purchase, translate } = this.props;
		const { expiryDate } = purchase;

		const expirationDate = this.props.moment( expiryDate ).format( 'LL' );

		if ( isDomainRegistration( purchase ) ) {
			// Domain in AGP bought with domain credits
			if ( isRefundable( purchase ) ) {
				return translate(
					'After you confirm this change, the domain will be removed immediately.'
				);
			}
			return translate(
				'After you confirm this change, the domain will be removed on %(expirationDate)s.',
				{
					args: { expirationDate },
				}
			);
		}

		return translate(
			'After you confirm this change, the subscription will be removed on %(expirationDate)s.',
			{
				args: { expirationDate },
			}
		);
	};

	renderFullText = () => {
		const { includedDomainPurchase, purchase, translate } = this.props;
		const { expiryDate } = purchase;
		const expirationDate = this.props.moment( expiryDate ).format( 'LL' );

		const refundAmountString = this.renderRefundAmountString(
			purchase,
			this.state.cancelBundledDomain,
			includedDomainPurchase
		);

		if ( refundAmountString ) {
			return translate(
				'If you confirm this cancellation, you will receive a {{span}}refund of %(refundText)s{{/span}}, and your subscription will be removed immediately.',
				{
					args: {
						refundText: refundAmountString,
					},
					context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
					components: {
						span: <span className="cancel-purchase__refund-string" />,
					},
				}
			);
		}

		return translate(
			'If you complete this cancellation, your subscription will be removed on {{span}}%(expirationDate)s{{/span}}.',
			{
				args: {
					expirationDate,
				},
				components: {
					span: <span className="cancel-purchase__warning-string" />,
				},
			}
		);
	};

	renderFooterText = () => {
		const { purchase, translate } = this.props;

		const refundAmountString = this.renderRefundAmountString(
			purchase,
			this.state.cancelBundledDomain,
			this.props.includedDomainPurchase
		);

		if ( refundAmountString ) {
			return translate( '%(refundText)s to be refunded', {
				args: {
					refundText: refundAmountString,
				},
				context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
			} );
		}
	};

	renderRefundAmountString = ( purchase, cancelBundledDomain, includedDomainPurchase ) => {
		const { refundInteger, totalRefundInteger, totalRefundCurrency } = purchase;

		if ( hasAmountAvailableToRefund( purchase ) ) {
			if ( cancelBundledDomain && includedDomainPurchase ) {
				return formatCurrency( totalRefundInteger, totalRefundCurrency, {
					isSmallestUnit: true,
				} );
			}
			return formatCurrency( refundInteger, totalRefundCurrency, {
				isSmallestUnit: true,
			} );
		}

		return null;
	};

	renderCancelButton = () => {
		const {
			purchase,
			includedDomainPurchase,
			siteSlug,
			purchaseListUrl,
			getConfirmCancelDomainUrlFor,
		} = this.props;
		return (
			<CancelPurchaseButton
				purchase={ purchase }
				includedDomainPurchase={ includedDomainPurchase }
				disabled={ this.state.cancelBundledDomain && ! this.state.confirmCancelBundledDomain }
				siteSlug={ siteSlug }
				cancelBundledDomain={ this.state.cancelBundledDomain }
				purchaseListUrl={ purchaseListUrl }
				getConfirmCancelDomainUrlFor={ getConfirmCancelDomainUrlFor }
				activeSubscriptions={ this.getActiveMarketplaceSubscriptions() }
			/>
		);
	};

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}

		if ( isDataLoading( this.props ) ) {
			return (
				<div>
					<QueryUserPurchases />
					<CancelPurchaseLoadingPlaceholder />
				</div>
			);
		}

		if ( this.props.isHundredYearDomain ) {
			this.redirect();
			return null;
		}

		const { purchase, isJetpackPurchase } = this.props;
		const purchaseName = getName( purchase );
		const plan = getPlan( purchase?.productSlug );
		const planDescription = plan?.getPlanCancellationDescription?.();
		const { siteName, siteId } = purchase;

		const cancellationFeatures =
			plan && 'getCancellationFeatures' in plan ? plan.getCancellationFeatures?.() ?? [] : [];

		let heading;

		if ( isDomainRegistration( purchase ) || isOneTimePurchase( purchase ) ) {
			heading = this.props.translate( 'Cancel %(purchaseName)s', {
				args: { purchaseName },
			} );
		}

		if ( isSubscription( purchase ) ) {
			heading = this.props.translate( 'Cancel your %(purchaseName)s subscription', {
				args: { purchaseName },
			} );
		}

		return (
			<Card className="cancel-purchase__wrapper-card">
				<QueryProductsList />
				<TrackPurchasePageView
					eventName="calypso_cancel_purchase_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>

				<div className="cancel-purchase__back">
					<HeaderCakeBack
						icon="chevron-left"
						href={ this.props.getManagePurchaseUrlFor(
							this.props.siteSlug,
							this.props.purchaseId
						) }
					/>
				</div>

				<FormattedHeader
					className="cancel-purchase__formatted-header"
					brandFont
					headerText={ heading }
					align="left"
				/>

				<div className="cancel-purchase__inner-wrapper">
					<div className="cancel-purchase__left">
						<BackupRetentionOptionOnCancelPurchase purchase={ purchase } />

						<CancelPurchaseRefundInformation
							purchase={ purchase }
							isJetpackPurchase={ isJetpackPurchase }
						/>

						<CancelPurchaseFeatureList
							purchase={ purchase }
							cancellationFeatures={ cancellationFeatures }
						/>

						<CancelPurchaseDomainOptions
							includedDomainPurchase={ this.props.includedDomainPurchase }
							cancelBundledDomain={ this.state.cancelBundledDomain }
							onCancelConfirmationStateChange={ this.onCancelConfirmationStateChange }
							purchase={ purchase }
						/>

						{ ! cancellationFeatures.length ? (
							<>
								<CompactCard className="cancel-purchase__product-information">
									<div className="cancel-purchase__purchase-name">{ purchaseName }</div>
									<div className="cancel-purchase__description">{ purchaseType( purchase ) }</div>
									{ planDescription && (
										<div className="cancel-purchase__plan-description">{ planDescription }</div>
									) }
									<ProductLink purchase={ purchase } selectedSite={ this.props.site } />
								</CompactCard>

								<CompactCard className="cancel-purchase__footer">
									<div className="cancel-purchase__footer-text">
										{ hasAmountAvailableToRefund( purchase ) ? (
											<p className="cancel-purchase__refund-amount">{ this.renderFooterText() }</p>
										) : (
											<p className="cancel-purchase__expiration-text">
												{ this.renderExpirationText() }
											</p>
										) }
									</div>
									{ this.renderCancelButton() }
								</CompactCard>
							</>
						) : (
							<>
								<p>{ this.renderFullText() }</p>
								<div className="cancel-purchase__confirm-buttons">
									{ this.renderCancelButton() }
									<FormButton
										isPrimary={ false }
										href={ this.props.getManagePurchaseUrlFor(
											this.props.siteSlug,
											this.props.purchaseId
										) }
									>
										{ this.props.translate( 'Keep subscription' ) }
									</FormButton>
								</div>
							</>
						) }
					</div>

					<div className="cancel-purchase__right">
						<PurchaseSiteHeader siteId={ siteId } name={ siteName } purchase={ purchase } />
						<SupportLink usage="cancel-purchase" purchase={ purchase } />
					</div>
				</div>
			</Card>
		);
	}
}

export default connect( ( state, props ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );
	const isJetpackPurchase =
		purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );
	const purchases = purchase && getSitePurchases( state, purchase.siteId );
	const productsList = getProductsList( state );

	const domains = purchase && getDomainsBySiteId( state, purchase.siteId );
	const selectedDomainName = purchase && getName( purchase );
	const selectedDomain =
		domains && selectedDomainName && getSelectedDomain( { domains, selectedDomainName } );

	return {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		isJetpackPurchase,
		purchase,
		purchases,
		productsList,
		includedDomainPurchase: getIncludedDomainPurchase( state, purchase ),
		site: getSite( state, purchase ? purchase.siteId : null ),
		isHundredYearDomain: selectedDomain?.isHundredYearDomain,
	};
} )( localize( withLocalizedMoment( CancelPurchase ) ) );
