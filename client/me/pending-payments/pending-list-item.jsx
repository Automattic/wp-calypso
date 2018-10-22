/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';

export function PendingListItem( { productName, paymentType, totalCostDisplay, translate } ) {
	return (
		<Card className={ 'pending-payments__list-item' }>
			<span className="pending-payments__list-item-wrapper">
				<div className="pending-payments__list-item-details">
					<div className="pending-payments__list-item-title">{ productName }</div>
					<div className="pending-payments__list-item-purchase-type">{ paymentType }</div>
					<div className="pending-payments__list-item-purchase-cost">{ totalCostDisplay }</div>
					<div className="pending-payments__list-item-actions">
						<Button primary={ true } href="/help/contact">
							<Gridicon icon="help" />
							<span>{ translate( 'Contact Support' ) }</span>
						</Button>
					</div>
				</div>
			</span>
		</Card>
	);
}

export default localize( PendingListItem );
