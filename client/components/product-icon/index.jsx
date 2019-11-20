/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import {
	isBloggerPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
	getPlan,
	getPlansKeys,
	getPlanClass,
} from 'lib/plans';
import {
	getProductClass,
	getProductsKeys,
	getProductShortName,
	isJetpackBackupSlug,
	isJetpackPlanSlug,
} from 'lib/products-values';

/**
 * Style dependencies
 */
import './style.scss';

export default class ProductIcon extends Component {
	getPlanIcon( iconName ) {
		const { product, className } = this.props;

		const plan = getPlan( product );
		const planTitle = plan.getTitle();
		const planClass = getPlanClass( product );
		const isJetpack = isJetpackPlanSlug( product );

		return (
			<img
				src={ `/calypso/images/plans/${ isJetpack ? 'jetpack' : 'wpcom' }/plan-${ iconName }.svg` }
				className={ classNames(
					'product-icon',
					`product-icon__${ iconName }`,
					planClass,
					className
				) }
				alt={ planTitle }
			/>
		);
	}

	getProductIcon( iconName ) {
		const { product, className } = this.props;

		const productTitle = getProductShortName( product );
		const productClass = getProductClass( product );

		return (
			<img
				src={ `/calypso/images/products/jetpack/product-${ iconName }.svg` }
				className={ classNames(
					'product-icon',
					`product-icon__${ iconName }`,
					productClass,
					className
				) }
				alt={ productTitle }
			/>
		);
	}

	render() {
		const { product } = this.props;

		if ( isJetpackBackupSlug( product ) ) {
			return this.getProductIcon( 'backup' );
		}

		if ( isBloggerPlan( product ) ) {
			return this.getPlanIcon( 'blogger' );
		}

		if ( isPersonalPlan( product ) ) {
			return this.getPlanIcon( 'personal' );
		}

		if ( isPremiumPlan( product ) ) {
			return this.getPlanIcon( 'premium' );
		}

		if ( isBusinessPlan( product ) ) {
			return this.getPlanIcon( 'business' );
		}

		if ( isEcommercePlan( product ) ) {
			return this.getPlanIcon( 'ecommerce' );
		}

		return this.getPlanIcon( 'free' );
	}
}

ProductIcon.propTypes = {
	classNames: PropTypes.string,
	product: PropTypes.oneOf( [ ...getPlansKeys(), ...getProductsKeys() ] ).isRequired,
};
