/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PremiumPopover from 'components/plans/premium-popover';
const DomainProductPrice = React.createClass( {
	propTypes: {
		isLoading: React.PropTypes.bool,
		price: React.PropTypes.string,
		freeWithPlan: React.PropTypes.bool,
		requiresPlan: React.PropTypes.bool
	},
	renderFreeWithPlan() {
		return (
			<div className="domain-product-price is-free-domain">
				<span className="domain-product-price__price">{ this.translate( '%(cost)s {{small}}/year{{/small}}', {
					args: { cost: this.props.price },
					components: { small: <small /> }
				} ) }</span>
				<span className="domain-product-price__free-text" ref="subMessage">
					{ this.translate( 'Free with your plan' ) }
				</span>
			</div>
		);
	},
	renderFree() {
		return (
			<div className="domain-product-price">
				<span className="domain-product-price__price">{ this.translate( 'Free' ) }</span>
			</div>
		);
	},
	renderIncludedInPremium() {
		return (
			<div className="domain-product-price is-with-plans-only">
				<small className="domain-product-price__premium-text" ref="subMessage">
					{ this.translate( 'Included in WordPress.com Premium' ) }
					<PremiumPopover
						context={ this.refs && this.refs.subMessage }
						bindContextEvents
						position="bottom left"/>
				</small>
			</div>
		);
	},
	renderPrice() {
		return (
			<div className="domain-product-price">
				<span className="domain-product-price__price">
					{ this.translate( '%(cost)s {{small}}/year{{/small}}', {
						args: { cost: this.props.price },
						components: { small: <small /> }
					} ) }
				</span>
			</div>
		);
	},
	render() {
		if ( this.props.isLoading ) {
			return <div className="domain-product-price is-placeholder">{ this.translate( 'Loading…' ) }</div>;
		}

		switch ( this.props.rule ) {
			case 'FREE_DOMAIN':
				return this.renderFree();
			case 'FREE_WITH_PLAN':
				return this.renderFreeWithPlan();
			case 'INCLUDED_IN_PREMIUM':
				return this.renderIncludedInPremium();
			case 'PRICE':
			default:
				return this.renderPrice();
		}
	}
} );

export default DomainProductPrice;
