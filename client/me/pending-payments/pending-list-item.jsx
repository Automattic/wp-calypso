/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize, moment } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { getSite, getSiteTitle, getSiteUrl, getSiteDomain } from 'state/sites/selectors';
import PurchaseSiteHeader from '../purchases/purchases-site/header';
import { purchaseType } from 'lib/purchases';
import { paymentMethodName } from 'lib/cart-values';

export function PendingListItem( {
	translate,
	productName,
	productSlug,
	paymentType,
	totalCost,
	siteId,
	siteTitle,
	siteDomain,
	dateCreated,
} ) {
	return (
		<React.Fragment>
			<PurchaseSiteHeader siteId={ siteId } name={ siteTitle } domain={ siteDomain } />
			<Card className={ 'pending-payments__list-item is-compact' }>
				<span className="pending-payments__list-item-wrapper">
					<div className="pending-payments__list-item-details">
						<div className="pending-payments__list-item-title">{ productName }</div>
						<div className="pending-payments__list-item-payment">
							{ purchaseType( { product_slug: productSlug } ) }
						</div>
						<div className="pending-payments__list-item-created">
							{ translate(
								'Payment of %(totalCost)s was initiated on %(dateCreated)s via %(paymentType)s.',
								{
									args: {
										totalCost,
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

export default connect( ( state, props ) => ( {
	site: getSite( state, props.siteId ),
	siteTitle: getSiteTitle( state, props.siteId ),
	siteUrl: getSiteUrl( state, props.siteId ),
	siteDomain: getSiteDomain( state, props.siteId ),
} ) )( localize( PendingListItem ) );
