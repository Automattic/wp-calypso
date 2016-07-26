/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CancelPurchaseButton from './button';
import CancelPurchaseLoadingPlaceholder from 'me/purchases/cancel-purchase/loading-placeholder';
import CancelPurchaseRefundInformation from './refund-information';
import CompactCard from 'components/card/compact';
import { getName, isCancelable, isOneTimePurchase, isRefundable, isSubscription } from 'lib/purchases';
import { getPurchase, getSelectedSite, goToManagePurchase, recordPageView } from 'me/purchases/utils';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import { isDataLoading } from 'me/purchases/utils';
import { isDomainRegistration } from 'lib/products-values';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import paths from '../paths';
import QueryUserPurchases from 'components/data/query-user-purchases';
import ProductLink from 'me/purchases/product-link';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';

const user = userFactory();

const CancelPurchase = React.createClass( {
	propTypes: {
		hasLoadedSites: React.PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: React.PropTypes.bool.isRequired,
		selectedPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] )
	},

	componentWillMount() {
		if ( ! this.isDataValid() ) {
			this.redirect( this.props );
			return;
		}

		recordPageView( 'cancel_purchase', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( this.isDataValid() && ! this.isDataValid( nextProps ) ) {
			this.redirect( nextProps );
			return;
		}

		recordPageView( 'cancel_purchase', this.props, nextProps );
	},

	isDataValid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const purchase = getPurchase( props ),
			selectedSite = getSelectedSite( props );

		return selectedSite && purchase && isCancelable( purchase );
	},

	redirect( props ) {
		const purchase = getPurchase( props ),
			selectedSite = getSelectedSite( props );
		let redirectPath = paths.list();

		if ( selectedSite && purchase && ! isCancelable( purchase ) ) {
			redirectPath = paths.managePurchase( selectedSite.slug, purchase.id );
		}

		page.redirect( redirectPath );
	},

	renderFooterText() {
		const purchase = getPurchase( this.props ),
			{ refundText, renewDate } = purchase;

		if ( isRefundable( purchase ) ) {
			return this.translate( '%(refundText)s to be refunded', {
				args: { refundText },
				context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"'
			} );
		}

		const renewalDate = this.moment( renewDate ).format( 'LL' );

		if ( isDomainRegistration( purchase ) ) {
			return this.translate( 'Domain will be removed on %(renewalDate)s', {
				args: { renewalDate }
			} );
		}

		return this.translate( 'Subscription will be removed on %(renewalDate)s', {
			args: { renewalDate }
		} );
	},

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}

		if ( isDataLoading( this.props ) ) {
			return (
				<div>
					<QueryUserPurchases userId={ user.get().ID } />
					<CancelPurchaseLoadingPlaceholder
						purchaseId={ this.props.purchaseId }
						selectedSite={ this.props.selectedSite }
					/>
				</div>
			);
		}

		const purchase = getPurchase( this.props ),
			purchaseName = getName( purchase ),
			{ siteName, domain: siteDomain } = purchase;

		let heading;

		if ( isDomainRegistration( purchase ) || isOneTimePurchase( purchase ) ) {
			heading = this.translate( 'Cancel %(purchaseName)s', {
				args: { purchaseName }
			} );
		}

		if ( isSubscription( purchase ) ) {
			heading = this.translate( 'Cancel Your %(purchaseName)s Subscription', {
				args: { purchaseName }
			} );
		}

		return (
			<Main className="cancel-purchase">
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ titles.cancelPurchase }
				</HeaderCake>

				<Card className="cancel-purchase__card">
					<h2>
						{ heading }
					</h2>

					<CancelPurchaseRefundInformation purchase={ purchase } />
				</Card>

				<CompactCard className="cancel-purchase__product-information">
					<div className="cancel-purchase__purchase-name">{ purchaseName }</div>
					<div className="cancel-purchase__site-title">{ siteName || siteDomain }</div>
					<ProductLink
						selectedPurchase={ purchase }
						selectedSite={ this.props.selectedSite } />
				</CompactCard>
				<CompactCard className="cancel-purchase__footer">
					<div className="cancel-purchase__refund-amount">
						{ this.renderFooterText( this.props ) }
					</div>
					<CancelPurchaseButton
						purchase={ purchase }
						selectedSite={ this.props.selectedSite } />
				</CompactCard>
			</Main>
		);
	}
} );

export default connect(
	( state, props ) => ( {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase: getByPurchaseId( state, props.purchaseId ),
		selectedSite: getSelectedSiteSelector( state )
	} )
)( CancelPurchase );
