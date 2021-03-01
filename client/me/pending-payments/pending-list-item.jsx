/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getSite, getSiteTitle, getSiteDomain } from 'calypso/state/sites/selectors';
import PurchaseSiteHeader from '../purchases/purchases-site/header';
import { purchaseType as getPurchaseType, getName } from 'calypso/lib/purchases';
import { paymentMethodName } from 'calypso/lib/cart-values';

export function PendingListItem( {
	paymentType,
	totalCost,
	currency,
	siteId,
	siteTitle,
	siteDomain,
	dateCreated,
	products,
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	// products being populated is not guaranteed
	const initialProduct = get( products, '0', {} );
	let productName = getName( initialProduct ) || '';
	let purchaseType = getPurchaseType( initialProduct ) || '';

	// match logic in client/me/billing-history/transactions-table.jsx
	if ( products.length > 1 ) {
		productName = translate( 'Multiple items' );
		purchaseType = translate( 'Various' );
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
} ) )( PendingListItem );
