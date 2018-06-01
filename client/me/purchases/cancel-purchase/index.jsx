/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CancelPurchaseButton from './button';
import CancelPurchaseLoadingPlaceholder from 'me/purchases/cancel-purchase/loading-placeholder';
import CancelPurchaseRefundInformation from './refund-information';
import CompactCard from 'components/card/compact';
import {
	getName,
	isCancelable,
	isOneTimePurchase,
	isRefundable,
	isSubscription,
} from 'lib/purchases';
import { isDataLoading } from 'me/purchases/utils';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
	getIncludedDomainPurchase,
} from 'state/purchases/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import { isDomainRegistration, isDomainTransfer } from 'lib/products-values';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import { managePurchase, purchasesRoot } from 'me/purchases/paths';
import QueryUserPurchases from 'components/data/query-user-purchases';
import ProductLink from 'me/purchases/product-link';
import titles from 'me/purchases/titles';
import TrackPurchasePageView from 'me/purchases/track-purchase-page-view';
import { getCurrentUserId } from 'state/current-user/selectors';

class CancelPurchase extends React.Component {
	static propTypes = {
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		purchase: PropTypes.object,
		purchaseId: PropTypes.number.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
		siteSlug: PropTypes.string.isRequired,
		userId: PropTypes.number,
	};

	state = {
		cancelBundledDomain: false,
		confirmCancelBundledDomain: false,
	};

	componentWillMount() {
		if ( ! this.isDataValid() ) {
			this.redirect( this.props );
			return;
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.isDataValid() && ! this.isDataValid( nextProps ) ) {
			this.redirect( nextProps );
			return;
		}
	}

	isDataValid = ( props = this.props ) => {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const { purchase, selectedSite } = props;

		// For domain transfers, we only allow cancel if it's also refundable
		const isDomainTransferCancelable = isRefundable( purchase ) || ! isDomainTransfer( purchase );

		return selectedSite && purchase && isCancelable( purchase ) && isDomainTransferCancelable;
	};

	redirect = props => {
		const { purchase } = props;
		const selectedSite = props.selectedSite;
		let redirectPath = purchasesRoot;

		if (
			selectedSite &&
			purchase &&
			( ! isCancelable( purchase ) || isDomainTransfer( purchase ) )
		) {
			redirectPath = managePurchase( purchase.id );
		}

		page.redirect( redirectPath );
	};

	onCancelConfirmationStateChange = newState => {
		this.setState( newState );
	};

	renderFooterText = () => {
		const { purchase } = this.props;
		const { refundText, renewDate, refundAmount, currencySymbol } = purchase;

		if ( isRefundable( purchase ) ) {
			if ( this.state.cancelBundledDomain && this.props.includedDomainPurchase ) {
				const fullRefundText =
					currencySymbol + ( refundAmount + this.props.includedDomainPurchase.amount );
				return this.props.translate( '%(refundText)s to be refunded', {
					args: { refundText: fullRefundText },
					context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
				} );
			}
			return this.props.translate( '%(refundText)s to be refunded', {
				args: { refundText },
				context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
			} );
		}

		const renewalDate = this.props.moment( renewDate ).format( 'LL' );

		if ( isDomainRegistration( purchase ) ) {
			return this.props.translate(
				'After you confirm this change, the domain will be removed on %(renewalDate)s',
				{
					args: { renewalDate },
				}
			);
		}

		return this.props.translate(
			'After you confirm this change, the subscription will be removed on %(renewalDate)s',
			{
				args: { renewalDate },
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
					<QueryUserPurchases userId={ this.props.userId } />
					<CancelPurchaseLoadingPlaceholder
						purchaseId={ this.props.purchaseId }
						selectedSite={ this.props.selectedSite }
					/>
				</div>
			);
		}

		const { purchase } = this.props;
		const purchaseName = getName( purchase );
		const { siteName, domain: siteDomain } = purchase;

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
			<Main className="cancel-purchase">
				<TrackPurchasePageView
					eventName="calypso_cancel_purchase_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>
				<HeaderCake backHref={ managePurchase( this.props.purchaseId ) }>
					{ titles.cancelPurchase }
				</HeaderCake>

				<Card className="cancel-purchase__card">
					<h2>{ heading }</h2>

					<CancelPurchaseRefundInformation
						purchase={ purchase }
						includedDomainPurchase={ this.props.includedDomainPurchase }
						confirmBundledDomain={ this.state.confirmCancelBundledDomain }
						cancelBundledDomain={ this.state.cancelBundledDomain }
						onCancelConfirmationStateChange={ this.onCancelConfirmationStateChange }
					/>
				</Card>

				<CompactCard className="cancel-purchase__product-information">
					<div className="cancel-purchase__purchase-name">{ purchaseName }</div>
					<div className="cancel-purchase__site-title">{ siteName || siteDomain }</div>
					<ProductLink purchase={ purchase } selectedSite={ this.props.selectedSite } />
				</CompactCard>
				<CompactCard className="cancel-purchase__footer">
					<div className="cancel-purchase__refund-amount">
						{ this.renderFooterText( this.props ) }
					</div>
					<CancelPurchaseButton
						purchase={ purchase }
						includedDomainPurchase={ this.props.includedDomainPurchase }
						disabled={ this.state.cancelBundledDomain && ! this.state.confirmCancelBundledDomain }
						selectedSite={ this.props.selectedSite }
						cancelBundledDomain={ this.state.cancelBundledDomain }
					/>
				</CompactCard>
			</Main>
		);
	}
}

export default connect( ( state, props ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );
	return {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		purchase,
		includedDomainPurchase: getIncludedDomainPurchase( state, purchase ),
		selectedSite: getSelectedSite( state ),
		userId: getCurrentUserId( state ),
	};
} )( localize( CancelPurchase ) );
