/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PremiumPopover from 'components/plans/premium-popover';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';

const DomainProductPrice = React.createClass( {
	propTypes: {
		isLoading: React.PropTypes.bool,
		price: React.PropTypes.string,
		freeWithPlan: React.PropTypes.bool,
		requiresPlan: React.PropTypes.bool,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired
	},
	renderFreeWithPlan() {
		return (
			<div
				className={ classnames(
					'domain-product-price',
					'is-free-domain',
					{ 'no-price': this.props.domainsWithPlansOnly } ) }>
				{ ! this.props.domainsWithPlansOnly && this.renderFreeWithPlanPrice() }
				<span className="domain-product-price__free-text" ref="subMessage">
					{ this.translate( 'Free with your plan' ) }
				</span>
			</div>
		);
	},
	renderFreeWithPlanPrice() {
		return (
			<span
				className="domain-product-price__price">{ this.translate( '%(cost)s {{small}}/year{{/small}}', {
					args: { cost: this.props.price },
					components: { small: <small /> }
				} ) }</span>
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
					<PremiumPopover
						position="bottom left"
						textLabel={ this.translate( 'Included in WordPress.com Premium' ) }/>
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

export default connect(
	state => ( { domainsWithPlansOnly: getCurrentUser( state ) ?
		currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ) :
		true
	} )
)( DomainProductPrice );
