import {
	PLAN_100_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
} from '@automattic/calypso-products';
import { DomainSuggestionPrice } from '@automattic/domain-search';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { DOMAIN_PRICE_RULE } from 'calypso/lib/cart-values/cart-items';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSitePlanSlug, hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export class DomainProductPrice extends Component {
	static propTypes = {
		isLoading: PropTypes.bool,
		salePrice: PropTypes.string,
		price: PropTypes.string,
		renewPrice: PropTypes.string,
		freeWithPlan: PropTypes.bool,
		requiresPlan: PropTypes.bool,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		isMappingProduct: PropTypes.bool,
		isCurrentPlan100YearPlan: PropTypes.bool,
		isBusinessOrEcommerceMonthlyPlan: PropTypes.bool,
		zeroCost: PropTypes.string,
	};

	static defaultProps = {
		isMappingProduct: false,
	};

	renderFreeForFirstYear() {
		const { zeroCost, price, renewPrice } = this.props;

		return (
			<DomainSuggestionPrice price={ price } salePrice={ zeroCost } renewPrice={ renewPrice } />
		);
	}

	renderFree() {
		const { translate } = this.props;

		return (
			<DomainSuggestionPrice
				price={ translate( 'Free', { context: 'Adjective refers to subdomain' } ) }
			/>
		);
	}

	renderDomainMovePrice() {
		const { translate } = this.props;

		return (
			<DomainSuggestionPrice
				price={ translate( 'Move your existing domain.', {
					context: 'Line item description in cart.',
				} ) }
			/>
		);
	}

	renderPrice() {
		const { price, renewPrice, salePrice } = this.props;

		return (
			<DomainSuggestionPrice price={ price } salePrice={ salePrice } renewPrice={ renewPrice } />
		);
	}

	/**
	 * Used to render the price of 100-year domains, which are a one time purchase
	 */
	renderOneTimePrice() {
		const { price } = this.props;

		return <DomainSuggestionPrice price={ price } />;
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
			case DOMAIN_PRICE_RULE.ONE_TIME_PRICE:
				return this.renderOneTimePrice();
			case DOMAIN_PRICE_RULE.FREE_DOMAIN:
				return this.renderFree();
			case DOMAIN_PRICE_RULE.FREE_FOR_FIRST_YEAR:
			case DOMAIN_PRICE_RULE.FREE_WITH_PLAN:
			case DOMAIN_PRICE_RULE.INCLUDED_IN_HIGHER_PLAN:
			case DOMAIN_PRICE_RULE.UPGRADE_TO_HIGHER_PLAN_TO_BUY:
				return this.renderFreeForFirstYear();
			case DOMAIN_PRICE_RULE.DOMAIN_MOVE_PRICE:
				return this.renderDomainMovePrice();
			case DOMAIN_PRICE_RULE.PRICE:
			default:
				return this.renderPrice();
		}
	}
}

export default connect( ( state ) => {
	const sitePlanSlug = getSitePlanSlug( state, getSelectedSiteId( state ) );

	return {
		domainsWithPlansOnly: getCurrentUser( state )
			? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
			: true,
		isCurrentPlan100YearPlan: sitePlanSlug === PLAN_100_YEARS,
		isBusinessOrEcommerceMonthlyPlan:
			( sitePlanSlug === PLAN_BUSINESS_MONTHLY || sitePlanSlug === PLAN_ECOMMERCE_MONTHLY ) &&
			hasDomainCredit( state, getSelectedSiteId( state ) ),
	};
} )( localize( DomainProductPrice ) );
