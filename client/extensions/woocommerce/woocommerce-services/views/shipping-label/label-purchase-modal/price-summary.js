/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map, sum } from 'lodash';
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

	const renderService = ( itemName, itemCost, key, isTotal ) => {
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

	const retailSum = sum( map( priceBreakdown, 'retailRate' ) );
	const total = sum( map( priceBreakdown, 'rate' ) );
	const discount = total - retailSum;

	return (
		<Card>
			{ priceBreakdown.map( ( service, index ) => renderService( service.title, service.retailRate, index ) ) }
			{ 0 > discount ? renderService( translate( 'Your discount' ), discount, 'discount' ) : null }
			{ renderService( translate( 'Total' ), total, 'total', true ) }
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
