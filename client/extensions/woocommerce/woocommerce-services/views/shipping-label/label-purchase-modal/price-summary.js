/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import Tooltip from 'calypso/components/tooltip';
import { getTotalPriceBreakdown } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

class PriceSummary extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			tooltipVisible: false,
		};
	}

	showTooltip = () => {
		this.setState( { tooltipVisible: true } );
	};

	hideTooltip = () => {
		this.setState( { tooltipVisible: false } );
	};

	tooltipContextRef = React.createRef();

	renderDiscountExplanation = () => {
		const { translate } = this.props;
		return (
			<div className="label-purchase-modal__price-item-help">
				<Gridicon
					ref={ this.tooltipContextRef }
					icon="help-outline"
					onMouseEnter={ this.showTooltip }
					onMouseLeave={ this.hideTooltip }
					size={ 18 }
				/>
				<Tooltip
					className="label-purchase-modal__price-item-tooltip is-dialog-visible"
					isVisible={ this.state.tooltipVisible }
					context={ this.tooltipContextRef.current }
				>
					{ translate(
						'WooCommerce Services gives you access to USPS ' +
							'Commercial Pricing, which is discounted over Retail rates.'
					) }
				</Tooltip>
			</div>
		);
	};

	renderRow = ( itemName, itemCost, key, isTotal, isDiscount ) => {
		const className = classNames( 'label-purchase-modal__price-item', {
			'label-purchase-modal__price-item-total': isTotal,
		} );
		return (
			<div key={ key } className={ className }>
				<div className="label-purchase-modal__price-item-name">{ itemName }</div>
				{ isDiscount && this.renderDiscountExplanation() }
				<div className="label-purchase-modal__price-item-amount">
					{ formatCurrency( itemCost, 'USD' ) }
				</div>
			</div>
		);
	};

	render() {
		const { priceBreakdown, translate } = this.props;
		if ( ! priceBreakdown ) {
			return null;
		}

		const { prices, discount, total } = priceBreakdown;

		return (
			<Card>
				{ prices.map( ( service, index ) =>
					this.renderRow( service.title, service.retailRate, index )
				) }
				{ 0 < discount
					? this.renderRow( translate( 'Your discount' ), -discount, 'discount', false, true )
					: null }
				{ this.renderRow( translate( 'Total' ), total, 'total', true ) }
			</Card>
		);
	}
}

PriceSummary.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
};

export default connect( ( state, { orderId, siteId } ) => {
	const priceBreakdown = getTotalPriceBreakdown( state, orderId, siteId );
	return {
		priceBreakdown,
	};
} )( localize( PriceSummary ) );
