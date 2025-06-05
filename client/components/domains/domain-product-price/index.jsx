import {
	PLAN_100_YEARS,
	PLAN_PERSONAL,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
	getPlan,
} from '@automattic/calypso-products';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { DOMAIN_PRICE_RULE } from 'calypso/lib/cart-values/cart-items';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSitePlanSlug, hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

export class DomainProductPrice extends Component {
	static propTypes = {
		isLoading: PropTypes.bool,
		price: PropTypes.string,
		renewPrice: PropTypes.string,
		freeWithPlan: PropTypes.bool,
		requiresPlan: PropTypes.bool,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		isMappingProduct: PropTypes.bool,
		salePrice: PropTypes.string,
		isCurrentPlan100YearPlan: PropTypes.bool,
		isBusinessOrEcommerceMonthlyPlan: PropTypes.bool,
	};

	static defaultProps = {
		isMappingProduct: false,
	};

	renderRenewalPrice() {
		const { price, renewPrice, translate } = this.props;
		const isRenewCostDifferent = renewPrice && price !== renewPrice;

		if ( isRenewCostDifferent ) {
			return (
				<div className="domain-product-price__renewal-price">
					{ translate( 'Renews for %(cost)s {{small}}/year{{/small}}', {
						args: { cost: renewPrice },
						components: { small: <small /> },
						comment: '%(cost)s is the annual renewal price of the domain',
					} ) }
				</div>
			);
		}
	}

	// This method returns "Free for the first year" text (different from "Free with plan")
	renderFreeForFirstYear() {
		const { translate } = this.props;

		const className = clsx( 'domain-product-price', 'is-free-domain', {
			'domain-product-price__domain-step-signup-flow': this.props.showStrikedOutPrice,
		} );
		const priceText = this.props.translate( '%(cost)s/year', {
			args: { cost: this.props.price },
		} );

		return (
			<div className={ className }>
				<div className="domain-product-price__free-text">
					<span className="domain-product-price__free-price">
						{ translate( 'Free for the first year' ) }
					</span>
				</div>
				<div className="domain-product-price__price">
					<del>{ priceText }</del>
				</div>
			</div>
		);
	}

	renderFreeWithPlan() {
		const {
			isMappingProduct,
			translate,
			isCurrentPlan100YearPlan,
			isBusinessOrEcommerceMonthlyPlan,
		} = this.props;

		const className = clsx( 'domain-product-price is-free-domain', {
			'domain-product-price__domain-step-signup-flow': this.props.showStrikedOutPrice,
		} );

		let message;
		if (
			( isMappingProduct && this.props.rule === DOMAIN_PRICE_RULE.FREE_WITH_PLAN ) ||
			isCurrentPlan100YearPlan
		) {
			message = translate( 'Free with your plan' );
		} else if ( isMappingProduct ) {
			message = translate( 'Included in paid plans' );
		} else if ( isBusinessOrEcommerceMonthlyPlan ) {
			message = (
				<span className="domain-product-price__free-price">
					{ translate( 'Free domain for one year' ) }
				</span>
			);
		} else if ( this.props.rule === DOMAIN_PRICE_RULE.UPGRADE_TO_HIGHER_PLAN_TO_BUY ) {
			message = translate( '%(planName)s plan required', {
				args: { planName: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
			} );
		} else {
			message = translate( '{{span}}Free for the first year with annual paid plans{{/span}}', {
				components: { span: <span className="domain-product-price__free-price" /> },
			} );
		}

		return (
			<div className={ className }>
				<div className="domain-product-price__free-text">{ message }</div>
				<div className="domain-product-price__price">
					<del>
						{ this.props.isMappingProduct
							? null
							: this.props.translate( '%(cost)s/year', {
									args: { cost: this.props.price },
							  } ) }
					</del>
				</div>
			</div>
		);
	}

	renderFree() {
		const { showStrikedOutPrice, translate } = this.props;
		const className = clsx( 'domain-product-price domain-product-single-price', {
			'domain-product-price__domain-step-signup-flow': showStrikedOutPrice,
		} );

		const productPriceClassName = clsx( 'domain-product-price__price', {
			'domain-product-price__free-price': showStrikedOutPrice,
		} );

		return (
			<div className={ className }>
				<div className={ productPriceClassName }>
					<span>{ translate( 'Free', { context: 'Adjective refers to subdomain' } ) }</span>
				</div>
			</div>
		);
	}

	renderDomainMovePrice() {
		const { showStrikedOutPrice, translate } = this.props;

		const className = clsx( 'domain-product-price', {
			'domain-product-price__domain-step-signup-flow': showStrikedOutPrice,
		} );

		return (
			<div className={ className }>
				<span>
					{ translate( 'Move your existing domain.', {
						context: 'Line item description in cart.',
					} ) }
				</span>
			</div>
		);
	}

	renderSalePrice() {
		const { price, salePrice, translate } = this.props;

		const className = clsx( 'domain-product-price', 'is-free-domain', 'is-sale-domain', {
			'domain-product-price__domain-step-signup-flow': this.props.showStrikedOutPrice,
		} );

		return (
			<div className={ className }>
				<div className="domain-product-price__sale-price">
					{ translate( '%(salePrice)s {{small}}for the first year{{/small}}', {
						args: { salePrice },
						components: { small: <small /> },
					} ) }
				</div>
				<div className="domain-product-price__regular-price">
					{ translate( '%(cost)s {{small}}/year{{/small}}', {
						args: { cost: price },
						components: { small: <small /> },
						comment: '%(cost)s is the annual renewal price of a domain currently on sale',
					} ) }
				</div>
				{ this.renderRenewalPrice() }
			</div>
		);
	}

	renderPrice() {
		const { salePrice, showStrikedOutPrice, price, translate } = this.props;
		if ( salePrice ) {
			return this.renderSalePrice();
		}

		const className = clsx( 'domain-product-price domain-product-single-price', {
			'is-free-domain': showStrikedOutPrice,
			'domain-product-price__domain-step-signup-flow': showStrikedOutPrice,
		} );
		const productPriceClassName = showStrikedOutPrice ? '' : 'domain-product-price__price';

		return (
			<div className={ className }>
				<span className={ productPriceClassName }>
					{ translate( '%(cost)s {{small}}/year{{/small}}', {
						args: { cost: price },
						components: { small: <small /> },
					} ) }
				</span>
				{ this.renderRenewalPrice() }
			</div>
		);
	}

	/**
	 * Used to render the price of 100-year domains, which are a one time purchase
	 */
	renderOneTimePrice() {
		return (
			<div className="domain-product-price domain-product-single-price">
				<span>{ this.props.price }</span>
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
			case DOMAIN_PRICE_RULE.ONE_TIME_PRICE:
				return this.renderOneTimePrice();
			case DOMAIN_PRICE_RULE.FREE_DOMAIN:
				return this.renderFree();
			case DOMAIN_PRICE_RULE.FREE_FOR_FIRST_YEAR:
				return this.renderFreeForFirstYear();
			case DOMAIN_PRICE_RULE.FREE_WITH_PLAN:
			case DOMAIN_PRICE_RULE.INCLUDED_IN_HIGHER_PLAN:
			case DOMAIN_PRICE_RULE.UPGRADE_TO_HIGHER_PLAN_TO_BUY:
				return this.renderFreeWithPlan();
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
