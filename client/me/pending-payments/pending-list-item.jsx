/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize, moment } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { getSite, getSiteTitle, getSiteDomain } from 'state/sites/selectors';
import PurchaseSiteHeader from '../purchases/purchases-site/header';
import { purchaseType as getPurchaseType, getName } from 'lib/purchases';
import { paymentMethodName } from 'lib/cart-values';
import formatCurrency from 'lib/format-currency';

export function PendingListItem( {
	translate,
	paymentType,
	totalCost,
	currency,
	siteId,
	siteTitle,
	siteDomain,
	dateCreated,
	products,
} ) {
	let productName = '';
	let purchaseType = '';

	if ( products.length > 1 ) {
		productName = 'Multiple Items';
		purchaseType = 'Various';
	} else if ( products[ 0 ] ) {
		productName = getName( products[ 0 ] );
		purchaseType = getPurchaseType( products[ 0 ] );
	} else {
		productName = '';
		purchaseType = '';
	}

	return (
		<React.Fragment>
			<PurchaseSiteHeader siteId={ siteId } name={ siteTitle } domain={ siteDomain } />
			<Card className={ 'pending-payments__list-item is-compact' }>
				<span className="pending-payments__list-item-wrapper">
					<div className="pending-payments__list-item-details">
						<div className="pending-payments__list-item-title">{ productName }</div>
						<div className="pending-payments__list-item-product">{ purchaseType }</div>
						<div className="pending-payments__list-item-payment">
							{ translate(
								'Payment of %(totalCost)s was initiated on %(dateCreated)s via %(paymentType)s.',
								{
									args: {
										totalCost: formatCurrency( totalCost, currency ),
										dateCreated: moment( dateCreated ).format( 'LLL' ),
										paymentType: paymentMethodName( paymentType ),
									},
								}
							) }
						</div>
						<div className="pending-payments__list-item-actions">
							<Button primary={ false } compact href="/help/contact">
								<Gridicon icon="help" />
								<span>{ translate( 'Contact Support' ) }</span>
							</Button>
						</div>
					</div>
				</span>
			</Card>
		</React.Fragment>
	);
}

PendingListItem.propTypes = {
	translate: PropTypes.func.isRequired,
	paymentType: PropTypes.string.isRequired,
	totalCost: PropTypes.string.isRequired,
	currency: PropTypes.string.isRequired,
	siteId: PropTypes.number.isRequired,
	siteTitle: PropTypes.string.isRequired,
	siteDomain: PropTypes.string.isRequired,
	dateCreated: PropTypes.string.isRequired,
	products: PropTypes.array.isRequired,
};

export default connect( ( state, props ) => ( {
	site: getSite( state, props.siteId ),
	siteTitle: getSiteTitle( state, props.siteId ),
	siteDomain: getSiteDomain( state, props.siteId ),
} ) )( localize( PendingListItem ) );
