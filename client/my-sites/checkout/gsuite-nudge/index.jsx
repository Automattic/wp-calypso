/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, some, compact } from 'lodash';
import page from 'page';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import { GSUITE_BASIC_SLUG } from 'calypso/lib/gsuite/constants';
import GSuiteUpsellCard from 'calypso/components/upgrades/gsuite/gsuite-upsell-card';
import Main from 'calypso/components/main';
import QuerySites from 'calypso/components/data/query-sites';
import { getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import isEligibleForDotcomChecklist from 'calypso/state/selectors/is-eligible-for-dotcom-checklist';
import { getAllCartItems } from 'calypso/lib/cart-values/cart-items';
import { isDotComPlan } from 'calypso/lib/products-values';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { getProductsList } from 'calypso/state/products-list/selectors/get-products-list';
import getThankYouPageUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url';

/**
 * Style dependencies
 */
import './style.scss';

export class GSuiteNudge extends React.Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		receiptId: PropTypes.number.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
	};

	handleSkipClick = () => {
		const getThankYouPageUrlArguments = {
			siteSlug: this.props.siteSlug,
			receiptId: this.props.receiptId,
			cart: this.props.cart,
		};
		const url = getThankYouPageUrl( getThankYouPageUrlArguments );
		page.redirect( url );
	};

	handleAddEmailClick = ( cartItems ) => {
		const { siteSlug, receiptId, productsList } = this.props;
		this.removePlanFromCart();

		this.props.shoppingCartManager
			.addProductsToCart(
				// add `receipt_for_domain` to cartItem extras
				cartItems
					.map( ( item ) => ( {
						...item,
						extra: { ...item.extra, receipt_for_domain: receiptId },
					} ) )
					.map( ( item ) => fillInSingleCartItemAttributes( item, productsList ) )
			)
			.then( () => {
				this.props.isMounted && page( `/checkout/${ siteSlug }` );
			} );
	};

	removePlanFromCart = () => {
		const items = getAllCartItems( this.props.cart );
		const filteredProducts = items.filter( isDotComPlan );
		this.props.shoppingCartManager.replaceProductsInCart( filteredProducts );
	};

	render() {
		const { domain, receiptId, selectedSiteId, siteSlug, siteTitle, translate } = this.props;

		return (
			<Main className="gsuite-nudge">
				<PageViewTracker
					path={
						receiptId
							? '/checkout/:site/with-gsuite/:domain/:receipt_id'
							: '/checkout/:site/with-gsuite/:domain'
					}
					title="G Suite Upsell"
					properties={ { site: siteSlug, domain, ...( receiptId && { receipt_id: receiptId } ) } }
				/>
				<DocumentHead
					title={ translate( 'Add G Suite < %(siteTitle)s', {
						args: { siteTitle },
					} ) }
				/>
				<QuerySites siteId={ selectedSiteId } />
				<GSuiteUpsellCard
					domain={ this.props.domain }
					productSlug={ GSUITE_BASIC_SLUG }
					onSkipClick={ this.handleSkipClick }
					onAddEmailClick={ this.handleAddEmailClick }
				/>
			</Main>
		);
	}
}

export default connect( ( state, props ) => {
	const { receiptId, selectedSiteId: siteId } = props;
	const purchases = get( getReceiptById( state, receiptId ), 'data.purchases', [] );
	const isEligibleForChecklist =
		some( compact( purchases ), isDotComPlan ) && isEligibleForDotcomChecklist( state, siteId );

	return {
		siteSlug: getSiteSlug( state, props.selectedSiteId ),
		siteTitle: getSiteTitle( state, props.selectedSiteId ),
		isEligibleForChecklist,
		productsList: getProductsList( state ),
	};
} )( withShoppingCart( localize( GSuiteNudge ) ) );
