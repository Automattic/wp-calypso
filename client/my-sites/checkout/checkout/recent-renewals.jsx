/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import moment from 'moment';

/**
 * Internal dependencies
 */
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePurchases } from 'state/purchases/selectors';

function RecentRenewalListItem( { domain, productName, expiryMoment, translate } ) {
	return (
		expiryMoment && (
			<li>
				<strong>{ domain }</strong>{ ' ' }
				{ translate( '%(productName)s recently renewed and will expire on %(expiryDate)s', {
					args: {
						productName,
						expiryDate: expiryMoment.format( 'LL' ),
					},
				} ) }
				.
			</li>
		)
	);
}

RecentRenewalListItem.propTypes = {
	domain: PropTypes.string.isRequired,
	productName: PropTypes.string.isRequired,
	expiryMoment: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

function getRecentRenewalProductsMatchingIds( products, ids ) {
	const oldestMoment = moment().subtract( 30, 'days' );
	return products.filter( product => {
		return (
			ids.includes( product.productId ) &&
			product.subscriptionStatus === 'active' &&
			product.productName &&
			product.expiryMoment &&
			product.mostRecentRenewMoment &&
			product.mostRecentRenewMoment.isAfter( oldestMoment )
		);
	} );
}

export function RecentRenewals( { purchases, siteId, cart, translate } ) {
	const idsInCart = cart.products ? cart.products.map( product => product.product_id ) : [];
	const recentRenewals = getRecentRenewalProductsMatchingIds( purchases, idsInCart );
	const productListItems = recentRenewals.map( product => {
		const domain = product.isDomainRegistration
			? product.meta || product.domain
			: product.includedDomain || product.domain;
		return (
			<RecentRenewalListItem
				key={ product.id }
				domain={ domain }
				productName={ product.productName }
				expiryMoment={ product.expiryMoment }
				translate={ translate }
			/>
		);
	} );
	const productList = productListItems.length ? (
		<ul className="checkout__recent-renewals">{ productListItems }</ul>
	) : null;
	return (
		<React.Fragment>
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			{ productList }
		</React.Fragment>
	);
}

RecentRenewals.propTypes = {
	purchases: PropTypes.array.isRequired,
	cart: PropTypes.object,
	siteId: PropTypes.number.isRequired,
	translate: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	return {
		purchases: getSitePurchases( state, siteId ),
		siteId,
	};
};

export default connect( mapStateToProps )( localize( RecentRenewals ) );
