import {
	isDomainRegistration,
	isDomainTransfer,
	isPlan,
	hasMarketplaceProduct,
	isJetpackPlan,
	isJetpackProduct,
} from '@automattic/calypso-products';
import { Card, CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
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
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { isDataLoading } from 'calypso/me/purchases/utils';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	getByPurchaseId,
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
	getIncludedDomainPurchase,
} from 'calypso/state/purchases/selectors';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import CancelPurchaseButton from './button';
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

	renderFooterText = () => {
		const { purchase } = this.props;
		const { refundText, expiryDate, totalRefundText } = purchase;

		if ( hasAmountAvailableToRefund( purchase ) ) {
			if ( this.state.cancelBundledDomain && this.props.includedDomainPurchase ) {
				return this.props.translate( '%(refundText)s to be refunded', {
					args: { refundText: totalRefundText },
					context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
				} );
			}
			return this.props.translate( '%(refundText)s to be refunded', {
				args: { refundText },
				context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
			} );
		}

		const expirationDate = this.props.moment( expiryDate ).format( 'LL' );

		if ( isDomainRegistration( purchase ) ) {
			return this.props.translate(
				'After you confirm this change, the domain will be removed on %(expirationDate)s',
				{
					args: { expirationDate },
				}
			);
		}

		return this.props.translate(
			'After you confirm this change, the subscription will be removed on %(expirationDate)s',
			{
				args: { expirationDate },
			}
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
					<CancelPurchaseLoadingPlaceholder
						purchaseId={ this.props.purchaseId }
						siteSlug={ this.props.siteSlug }
						getManagePurchaseUrlFor={ this.props.getManagePurchaseUrlFor }
					/>
				</div>
			);
		}

		const { purchase, isJetpackPurchase } = this.props;
		const purchaseName = getName( purchase );
		const { siteName, domain: siteDomain, siteId } = purchase;

		let heading;

		if ( isDomainRegistration( purchase ) || isOneTimePurchase( purchase ) ) {
			heading = this.props.translate( 'Cancel %(purchaseName)s', {
				args: { purchaseName },
			} );
		}

		if ( isSubscription( purchase ) ) {
			heading = this.props.translate( 'Cancel Your %(purchaseName)s Subscription', {
				args: { purchaseName },
			} );
		}

		return (
			<Fragment>
				<QueryProductsList />
				<TrackPurchasePageView
					eventName="calypso_cancel_purchase_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>

				<HeaderCake
					backHref={ this.props.getManagePurchaseUrlFor(
						this.props.siteSlug,
						this.props.purchaseId
					) }
				>
					{ titles.cancelPurchase }
				</HeaderCake>

				<Card className="cancel-purchase__card">
					<h2>{ heading }</h2>

					<CancelPurchaseRefundInformation
						purchase={ purchase }
						isJetpackPurchase={ isJetpackPurchase }
						includedDomainPurchase={ this.props.includedDomainPurchase }
						confirmBundledDomain={ this.state.confirmCancelBundledDomain }
						cancelBundledDomain={ this.state.cancelBundledDomain }
						onCancelConfirmationStateChange={ this.onCancelConfirmationStateChange }
					/>
				</Card>

				<PurchaseSiteHeader siteId={ siteId } name={ siteName } domain={ siteDomain } />
				<CompactCard className="cancel-purchase__product-information">
					<div className="cancel-purchase__purchase-name">{ purchaseName }</div>
					<div className="cancel-purchase__description">{ purchaseType( purchase ) }</div>
					<ProductLink purchase={ purchase } selectedSite={ this.props.site } />
				</CompactCard>
				<CompactCard className="cancel-purchase__footer">
					<div className="cancel-purchase__refund-amount">
						{ this.renderFooterText( this.props ) }
					</div>
					<CancelPurchaseButton
						purchase={ purchase }
						includedDomainPurchase={ this.props.includedDomainPurchase }
						disabled={ this.state.cancelBundledDomain && ! this.state.confirmCancelBundledDomain }
						siteSlug={ this.props.siteSlug }
						cancelBundledDomain={ this.state.cancelBundledDomain }
						purchaseListUrl={ this.props.purchaseListUrl }
						getConfirmCancelDomainUrlFor={ this.props.getConfirmCancelDomainUrlFor }
						activeSubscriptions={ this.getActiveMarketplaceSubscriptions() }
					/>
				</CompactCard>
			</Fragment>
		);
	}
}

export default connect( ( state, props ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );
	const isJetpackPurchase =
		purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );
	const purchases = purchase && getSitePurchases( state, purchase.siteId );
	const productsList = getProductsList( state );
	return {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		isJetpackPurchase,
		purchase,
		purchases,
		productsList,
		includedDomainPurchase: getIncludedDomainPurchase( state, purchase ),
		site: getSite( state, purchase ? purchase.siteId : null ),
	};
} )( localize( withLocalizedMoment( CancelPurchase ) ) );
