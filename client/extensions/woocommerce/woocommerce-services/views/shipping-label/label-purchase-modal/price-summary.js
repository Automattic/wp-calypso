/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import Card from 'components/card';
import formatCurrency from 'lib/format-currency';
import {
	getPriceBreakdown,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const PriceSummary = ( { priceBreakdown, translate } ) => {
	if ( ! priceBreakdown ) {
		return null;
	}

	const renderRow = ( itemName, itemCost, key, isTotal ) => {
		const className = classNames( 'label-purchase-modal__price-item', {
			'label-purchase-modal__price-item-total': isTotal,
		} );
		return (
			<div key={ key } className={ className }>
				<div className="label-purchase-modal__price-item-name">{ itemName }</div>
				<div>{ formatCurrency( itemCost, 'USD' ) }</div>
			</div>
		);
	};

	const { prices, fee, discount, total } = priceBreakdown;

	return (
		<Card>
			{ prices.map( ( service, index ) => renderRow( service.title, service.retailRate, index ) ) }
			{ 0 < fee ? renderRow( translate( 'Labels fee' ), fee, 'fee' ) : null }
			{ 0 < discount ? renderRow( translate( 'Your discount' ), -discount, 'discount' ) : null }
			{ renderRow( translate( 'Total' ), total, 'total', true ) }
		</Card>
	);
};

PriceSummary.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
};

export default connect( ( state, { orderId, siteId } ) => {
	const priceBreakdown = getPriceBreakdown( state, orderId, siteId );
	return {
		priceBreakdown,
	};
} )( localize( PriceSummary ) );
