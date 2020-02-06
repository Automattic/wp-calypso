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
import InfoPopover from 'components/info-popover';

/**
 * Style dependencies
 */
import './style.scss';

class DomainProductPrice extends React.Component {
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

	isEligibleVariantForDomainTest() {
		const { showTestCopy, showDesignUpdate } = this.props;

		return showTestCopy || showDesignUpdate;
	}

	getDomainPricePopoverElement() {
		const { price, translate } = this.props;

		return (
			<InfoPopover iconSize={ 22 } position={ 'left' }>
				{ translate(
					'The registration fee for this domain is free for the first year with the purchase of any paid plan. ' +
						'It will renew for %(cost)s / year after that. {{a}}Learn more{{/a}}.',
					{
						args: { cost: price },
						components: {
							a: (
								<a
									href="https://en.support.wordpress.com/domains/domain-pricing-and-available-tlds/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</InfoPopover>
		);
	}

	renderFreeWithPlanText() {
		const { isMappingProduct, translate } = this.props;

		let message, popoverElement;
		switch ( this.props.rule ) {
			case 'FREE_WITH_PLAN':
				message = translate( 'First year free with your plan' );
				if ( isMappingProduct ) {
					message = translate( 'Free with your plan' );
				}
				break;
			case 'INCLUDED_IN_HIGHER_PLAN':
				if ( this.props.showTestCopy ) {
					message = translate( 'Registration fee: {{del}}%(cost)s{{/del}} {{span}}Free{{/span}}', {
						args: { cost: this.props.price },
						components: {
							del: <del />,
							span: <span className="domain-product-price__free-price" />,
						},
					} );
				} else if ( this.props.showDesignUpdate ) {
					message = translate( '{{del}}%(cost)s{{/del}} {{span}}Free with a paid plan{{/span}}', {
						args: { cost: this.props.price },
						components: {
							del: <del />,
							span: <span className="domain-product-price__free-price" />,
						},
					} );
					popoverElement = this.getDomainPricePopoverElement();
				} else {
					message = translate( 'First year included in paid plans' );
				}

				if ( isMappingProduct ) {
					message = translate( 'Included in paid plans' );
				}
				break;
			case 'UPGRADE_TO_HIGHER_PLAN_TO_BUY':
				message = translate( 'Personal plan required' );
				break;
		}

		const className = classnames( 'domain-product-price__free-text', {
			'domain-product-price__free-text-domain-step-copy-updates': this.isEligibleVariantForDomainTest(),
		} );

		return (
			<div className={ className }>
				{ popoverElement }
				{ message }
			</div>
		);
	}

	renderFreeWithPlanPrice() {
		if ( this.props.isMappingProduct ) {
			return;
		}

		let priceText;
		if ( this.props.showTestCopy ) {
			priceText = this.props.translate( 'Renews at %(cost)s / year', {
				args: { cost: this.props.price },
			} );
		} else if ( this.props.showDesignUpdate ) {
			if ( this.props.isFeatured ) {
				priceText = this.props.translate( 'Renews at %(cost)s / year. {{a}}Learn more{{/a}}.', {
					args: { cost: this.props.price },
					components: {
						a: (
							<a
								href="https://en.support.wordpress.com/domains/domain-pricing-and-available-tlds/"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				} );
			}
		} else {
			priceText = this.props.translate( 'Renewal: %(cost)s {{small}}/year{{/small}}', {
				args: { cost: this.props.price },
				components: { small: <small /> },
			} );
		}

		return priceText && <div className="domain-product-price__price">{ priceText }</div>;
	}

	renderFreeWithPlan() {
		const className = classnames( 'domain-product-price', 'is-free-domain', {
			'domain-product-price__domain-step-copy-updates': this.isEligibleVariantForDomainTest(),
		} );

		return (
			<div className={ className }>
				{ this.renderFreeWithPlanText() }
				{ this.renderFreeWithPlanPrice() }
			</div>
		);
	}

	renderFree() {
		const className = classnames( 'domain-product-price', {
			'domain-product-price__domain-step-copy-updates': this.isEligibleVariantForDomainTest(),
		} );

		const productPriceClassName = classnames( 'domain-product-price__price', {
			'domain-product-price__free-price': this.isEligibleVariantForDomainTest(),
		} );

		return (
			<div className={ className }>
				<div className={ productPriceClassName }>{ this.props.translate( 'Free' ) }</div>
			</div>
		);
	}

	renderSalePrice() {
		const { price, salePrice, translate } = this.props;

		return (
			<div className="domain-product-price is-free-domain">
				<div className="domain-product-price__sale-price">{ salePrice }</div>
				<div className="domain-product-price__renewal-price">
					{ translate( 'Renews at: %(cost)s {{small}}/year{{/small}}', {
						args: { cost: price },
						components: { small: <small /> },
					} ) }
				</div>
			</div>
		);
	}

	renderPrice() {
		if ( this.props.salePrice ) {
			return this.renderSalePrice();
		}

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
			case 'INCLUDED_IN_HIGHER_PLAN':
			case 'UPGRADE_TO_HIGHER_PLAN_TO_BUY':
				return this.renderFreeWithPlan();
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
