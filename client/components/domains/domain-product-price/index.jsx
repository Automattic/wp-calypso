import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';

import './style.scss';

class DomainProductPrice extends Component {
	static propTypes = {
		isLoading: PropTypes.bool,
		price: PropTypes.string,
		freeWithPlan: PropTypes.bool,
		requiresPlan: PropTypes.bool,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		isMappingProduct: PropTypes.bool,
		salePrice: PropTypes.string,
	};

	static defaultProps = {
		isMappingProduct: false,
	};

	renderFreeWithPlanText() {
		const { isMappingProduct, translate } = this.props;

		let message;
		switch ( this.props.rule ) {
			case 'FREE_WITH_PLAN':
				if ( isMappingProduct ) {
					message = translate( 'Free with your plan' );
				} else {
					return this.renderReskinFreeWithPlanText();
				}
				break;
			case 'INCLUDED_IN_HIGHER_PLAN':
				if ( isMappingProduct ) {
					message = translate( 'Included in paid plans' );
				} else {
					return this.renderReskinFreeWithPlanText();
				}
				break;
			case 'UPGRADE_TO_HIGHER_PLAN_TO_BUY':
				message = translate( 'Personal plan required' );
				break;
		}

		return <div className="domain-product-price__free-text">{ message }</div>;
	}

	renderFreeWithPlanPrice() {
		if ( this.props.isMappingProduct ) {
			return;
		}
		return this.renderReskinDomainPrice();
	}

	renderReskinFreeWithPlanText() {
		const { isMappingProduct, translate } = this.props;

		const domainPriceElement = ( message ) => (
			<div className="domain-product-price__free-text">{ message }</div>
		);

		if ( isMappingProduct ) {
			return domainPriceElement( translate( 'Included in paid plans' ) );
		}

		const message = translate( '{{span}}Free for the first year{{/span}}', {
			components: { span: <span className="domain-product-price__free-price" /> },
		} );

		return domainPriceElement( message );
	}

	renderReskinDomainPrice() {
		const priceText = this.props.translate( '%(cost)s/year', {
			args: { cost: this.props.price },
		} );

		return (
			<div className="domain-product-price__price">
				<del>{ priceText }</del>
			</div>
		);
	}

	renderFreeWithPlan() {
		const className = classnames( 'domain-product-price', 'is-free-domain', {
			'domain-product-price__domain-step-signup-flow': this.props.showStrikedOutPrice,
		} );

		if ( this.props.isReskinned ) {
			return (
				<div className={ className }>
					{ this.renderReskinFreeWithPlanText() }
					{ this.renderReskinDomainPrice() }
				</div>
			);
		}

		return (
			<div className={ className }>
				{ this.renderFreeWithPlanText() }
				{ this.renderFreeWithPlanPrice() }
			</div>
		);
	}

	renderFree() {
		const { showStrikedOutPrice, translate } = this.props;

		const className = classnames( 'domain-product-price', {
			'domain-product-price__domain-step-signup-flow': showStrikedOutPrice,
		} );

		const productPriceClassName = classnames( 'domain-product-price__price', {
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

	renderSalePrice() {
		const { price, salePrice, translate } = this.props;

		const className = classnames( 'domain-product-price', 'is-free-domain', 'is-sale-domain', {
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
				<div className="domain-product-price__renewal-price">
					{ translate( '%(cost)s {{small}}/year{{/small}}', {
						args: { cost: price },
						components: { small: <small /> },
						comment: '%(cost)s is the annual renewal price of a domain currently on sale',
					} ) }
				</div>
			</div>
		);
	}

	renderPrice() {
		const { salePrice, showStrikedOutPrice, price, translate } = this.props;
		if ( salePrice ) {
			return this.renderSalePrice();
		}

		const className = classnames( 'domain-product-price', {
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
			case 'INCLUDED_IN_HIGHER_PLAN':
			case 'UPGRADE_TO_HIGHER_PLAN_TO_BUY':
				return this.renderFreeWithPlan();
			case 'PRICE':
			default:
				return this.renderPrice();
		}
	}
}

export default connect( ( state ) => ( {
	domainsWithPlansOnly: getCurrentUser( state )
		? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
		: true,
} ) )( localize( DomainProductPrice ) );
