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

	renderFreeWithPlanText() {
		const { isMappingProduct, isSignupStep, selectedPaidPlanInSwapFlow, translate } = this.props;

		let message;
		switch ( this.props.rule ) {
			case 'FREE_WITH_PLAN':
				message = translate( 'First year free with your plan' );
				if ( isMappingProduct ) {
					message = translate( 'Free with your plan' );
				}
				break;
			case 'INCLUDED_IN_HIGHER_PLAN':
				//TODO: TEST_PENDING
				if ( isSignupStep ) {
					if ( selectedPaidPlanInSwapFlow ) {
						message = translate(
							'Registration fee: {{del}}%(cost)s{{/del}} {{span}}Free with your plan{{/span}}',
							{
								args: { cost: this.props.price },
								components: {
									del: <del />,
									span: <span className="domain-product-price__free-price" />,
								},
							}
						);
					} else {
						message = translate(
							'Registration fee: {{del}}%(cost)s{{/del}} {{span}}Free{{/span}}',
							{
								args: { cost: this.props.price },
								components: {
									del: <del />,
									span: <span className="domain-product-price__free-price" />,
								},
							}
						);
					}
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

		return <div className="domain-product-price__free-text">{ message }</div>;
	}

	renderFreeWithPlanPrice() {
		if ( this.props.isMappingProduct ) {
			return;
		}

		//TODO: TEST_PENDING
		// This function can only be reached inside a sign up flow based on current implementation of site rule
		// Hence the else might not be possible to be tested
		const priceText = this.props.isSignupStep
			? this.props.translate( 'Renews at %(cost)s / year', {
					args: { cost: this.props.price },
			  } )
			: this.props.translate( 'Renewal: %(cost)s {{small}}/year{{/small}}', {
					args: { cost: this.props.price },
					components: { small: <small /> },
			  } );

		return <div className="domain-product-price__price">{ priceText }</div>;
	}

	//TODO: TEST_PENDING , can this flow be reached outside of signup?
	renderFreeWithPlan() {
		const className = classnames( 'domain-product-price', 'is-free-domain', {
			'domain-product-price__domain-step-copy-updates': this.props.isSignupStep,
		} );

		return (
			<div className={ className }>
				{ this.renderFreeWithPlanText() }
				{ this.renderFreeWithPlanPrice() }
			</div>
		);
	}

	//TODO: TEST_PENDING , can this flow be reached outside of signup?
	renderFree() {
		const { isSignupStep, translate } = this.props;

		const className = classnames( 'domain-product-price', {
			'domain-product-price__domain-step-copy-updates': isSignupStep,
		} );

		const productPriceClassName = classnames( 'domain-product-price__price', {
			'domain-product-price__free-price': isSignupStep,
		} );

		return (
			<div className={ className }>
				<div className={ productPriceClassName }>
					<span>{ translate( 'Free', { context: 'Adjective refers to subdomain' } ) }</span>
				</div>
			</div>
		);
	}

	//TODO: TEST_PENDING , can this flow be reached outside of signup?
	renderSalePrice() {
		const { price, salePrice, translate } = this.props;

		const className = classnames( 'domain-product-price', 'is-free-domain', {
			'domain-product-price__domain-step-copy-updates': this.props.isSignupStep,
		} );

		return (
			<div className={ className }>
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

	//VERIFIED_WORKING
	renderPrice() {
		const { salePrice, isSignupStep, price, translate } = this.props;
		if ( salePrice ) {
			return this.renderSalePrice();
		}

		const className = classnames( 'domain-product-price', {
			'is-free-domain': isSignupStep,
			'domain-product-price__domain-step-copy-updates': isSignupStep,
		} );

		const productPriceClassName = isSignupStep ? '' : 'domain-product-price__price';

		const renewalPrice = isSignupStep && (
			<div className="domain-product-price__renewal-price">
				{ translate( 'Renews at: %(cost)s {{small}}/year{{/small}}', {
					args: { cost: price },
					components: { small: <small /> },
				} ) }
			</div>
		);

		return (
			<div className={ className }>
				<span className={ productPriceClassName }>
					{ translate( '%(cost)s {{small}}/year{{/small}}', {
						args: { cost: price },
						components: { small: <small /> },
					} ) }
				</span>
				{ renewalPrice }
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
