/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';

class DomainProductPrice extends React.Component {
	static propTypes = {
		isLoading: PropTypes.bool,
		price: PropTypes.string,
		freeWithPlan: PropTypes.bool,
		requiresPlan: PropTypes.bool,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
	};

	renderFreeWithPlan() {
		return (
			<div
				className={ classnames( 'domain-product-price', 'is-free-domain', {
					'no-price': this.props.domainsWithPlansOnly,
				} ) }
			>
				{ ! this.props.domainsWithPlansOnly && this.renderFreeWithPlanPrice() }
				<span className="domain-product-price__free-text">
					{ this.props.translate( 'Free with your plan' ) }
				</span>
			</div>
		);
	}

	renderFreeWithPlanPrice() {
		return (
			<span className="domain-product-price__price">
				{ this.props.translate( '%(cost)s {{small}}/year{{/small}}', {
					args: { cost: this.props.price },
					components: { small: <small /> },
				} ) }
			</span>
		);
	}

	renderFree() {
		return (
			<div className="domain-product-price">
				<span className="domain-product-price__price">{ this.props.translate( 'Free' ) }</span>
			</div>
		);
	}

	renderIncludedInPremium() {
		const { translate } = this.props;

		return (
			<div className="domain-product-price domain-product-price__is-with-plans-only">
				{ translate( 'Included in paid plans' ) }
			</div>
		);
	}

	renderUpgradeToPremiumToBuy() {
		const { translate } = this.props;

		return (
			<div className="domain-product-price domain-product-price__is-with-plans-only">
				{ translate( 'Personal plan required' ) }
			</div>
		);
	}

	renderPrice() {
		return (
			<div className="domain-product-price">
				<span className="domain-product-price__price">
					{ this.props.translate( '%(cost)s {{small}}/year{{/small}}', {
						args: { cost: this.props.price },
						components: { small: <small /> },
					} ) }
				</span>
			</div>
		);
	}

	render() {
		if ( this.props.isLoading ) {
			return (
				<div className="domain-product-price is-placeholder">
					{ this.props.translate( 'Loading…' ) }
				</div>
			);
		}

		switch ( this.props.rule ) {
			case 'FREE_DOMAIN':
				return this.renderFree();
			case 'FREE_WITH_PLAN':
				return this.renderFreeWithPlan();
			case 'INCLUDED_IN_HIGHER_PLAN':
				return this.renderIncludedInPremium();
			case 'UPGRADE_TO_HIGHER_PLAN_TO_BUY':
				return this.renderUpgradeToPremiumToBuy();
			case 'PRICE':
			default:
				return this.renderPrice();
		}
	}
}

export default connect( state => ( {
	domainsWithPlansOnly: getCurrentUser( state )
		? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
		: true,
} ) )( localize( DomainProductPrice ) );
