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
import {
	getPurchase,
	getSelectedSite,
	goToManagePurchase,
	isDataLoading,
	recordPageView,
} from 'me/purchases/utils';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import { isDomainRegistration, isDomainTransfer } from 'lib/products-values';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import { managePurchase, purchasesRoot } from '../paths';
import QueryUserPurchases from 'components/data/query-user-purchases';
import ProductLink from 'me/purchases/product-link';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';

const user = userFactory();

class CancelPurchase extends React.Component {
	static propTypes = {
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	};

	componentWillMount() {
		if ( ! this.isDataValid() ) {
			this.redirect( this.props );
			return;
		}

		recordPageView( 'cancel_purchase', this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.isDataValid() && ! this.isDataValid( nextProps ) ) {
			this.redirect( nextProps );
			return;
		}

		recordPageView( 'cancel_purchase', this.props, nextProps );
	}

	isDataValid = ( props = this.props ) => {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const purchase = getPurchase( props );
		const selectedSite = getSelectedSite( props );

		// For domain transfers, we only allow cancel if it's also refundable
		const isDomainTransferCancelable = isRefundable( purchase ) || ! isDomainTransfer( purchase );

		return selectedSite && purchase && isCancelable( purchase ) && isDomainTransferCancelable;
	};

	redirect = props => {
		const purchase = getPurchase( props );
		const selectedSite = getSelectedSite( props );
		let redirectPath = purchasesRoot;

		if (
			selectedSite &&
			purchase &&
			( ! isCancelable( purchase ) || isDomainTransfer( purchase ) )
		) {
			redirectPath = managePurchase( selectedSite.slug, purchase.id );
		}

		page.redirect( redirectPath );
	};

	renderFooterText = () => {
		const purchase = getPurchase( this.props );
		const { refundText, renewDate } = purchase;

		if ( isRefundable( purchase ) ) {
			return this.props.translate( '%(refundText)s to be refunded', {
				args: { refundText },
				context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
			} );
		}

		const renewalDate = this.props.moment( renewDate ).format( 'LL' );

		if ( isDomainRegistration( purchase ) ) {
			return this.props.translate( 'Domain will be removed on %(renewalDate)s', {
				args: { renewalDate },
			} );
		}

		return this.props.translate( 'Subscription will be removed on %(renewalDate)s', {
			args: { renewalDate },
		} );
	};

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

		const purchase = getPurchase( this.props );
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
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ titles.cancelPurchase }
				</HeaderCake>

				<Card className="cancel-purchase__card">
					<h2>{ heading }</h2>

					<CancelPurchaseRefundInformation purchase={ purchase } />
				</Card>

				<CompactCard className="cancel-purchase__product-information">
					<div className="cancel-purchase__purchase-name">{ purchaseName }</div>
					<div className="cancel-purchase__site-title">{ siteName || siteDomain }</div>
					<ProductLink selectedPurchase={ purchase } selectedSite={ this.props.selectedSite } />
				</CompactCard>
				<CompactCard className="cancel-purchase__footer">
					<div className="cancel-purchase__refund-amount">
						{ this.renderFooterText( this.props ) }
					</div>
					<CancelPurchaseButton purchase={ purchase } selectedSite={ this.props.selectedSite } />
				</CompactCard>
			</Main>
		);
	}
}

export default connect( ( state, props ) => ( {
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	selectedPurchase: getByPurchaseId( state, props.purchaseId ),
	selectedSite: getSelectedSiteSelector( state ),
} ) )( localize( CancelPurchase ) );
