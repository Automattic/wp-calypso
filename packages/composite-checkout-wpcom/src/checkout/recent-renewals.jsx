/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import QuerySitePurchases from 'components/data/query-site-purchases';
import { useLocalizedMoment } from 'components/localized-moment';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePurchases } from 'state/purchases/selectors';

function RecentRenewalListItem( { domain, productName, expiryString, translate } ) {
	return (
		expiryString && (
			<li>
				<strong>{ domain }</strong>{ ' ' }
				{ translate( '%(productName)s recently renewed and will expire on %(expiryDate)s', {
					args: {
						productName,
						expiryDate: expiryString,
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
	expiryString: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

function getRecentRenewalProductsMatchingIds( products, ids, moment ) {
	const oldestMoment = moment().subtract( 30, 'days' );
	return products.filter( ( product ) => {
		return (
			ids.includes( product.productId ) &&
			product.subscriptionStatus === 'active' &&
			product.productName &&
			product.expiryDate &&
			product.mostRecentRenewDate &&
			moment( product.mostRecentRenewDate ).isAfter( oldestMoment )
		);
	} );
}

export function RecentRenewals( { purchases, siteId, cart } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const idsInCart = cart.products ? cart.products.map( ( product ) => product.product_id ) : [];
	const recentRenewals = getRecentRenewalProductsMatchingIds( purchases, idsInCart, moment );
	const productListItems = recentRenewals.map( ( product ) => {
		const domain = product.isDomainRegistration
			? product.meta || product.domain
			: product.includedDomain || product.domain;

		const expiry = moment( product.expiryDate );

		return (
			<RecentRenewalListItem
				key={ product.id }
				domain={ domain }
				productName={ product.productName }
				expiryString={ expiry.format( 'LL' ) }
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
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		purchases: getSitePurchases( state, siteId ),
		siteId,
	};
};

export default connect( mapStateToProps )( RecentRenewals );
