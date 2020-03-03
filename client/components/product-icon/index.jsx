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
	getPlansSlugs,
	getPlanClass,
} from 'lib/plans';
import {
	getProductClass,
	getProductsSlugs,
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

		const planClass = getPlanClass( product );
		const plansPath = isJetpackPlanSlug( product ) ? 'jetpack' : 'wpcom';

		/* eslint-disable jsx-a11y/alt-text */
		return (
			<img
				src={ `/calypso/images/plans/${ plansPath }/plan-${ iconName }.svg` }
				className={ classNames(
					'product-icon',
					`product-icon__${ iconName }`,
					planClass,
					className
				) }
			/>
		);
		/* eslint-enable jsx-a11y/alt-text */
	}

	getProductIcon( iconName ) {
		const { product, className } = this.props;

		const productClass = getProductClass( product );

		/* eslint-disable jsx-a11y/alt-text */
		return (
			<img
				src={ `/calypso/images/products/jetpack/product-${ iconName }.svg` }
				className={ classNames(
					'product-icon',
					`product-icon__${ iconName }`,
					productClass,
					className
				) }
			/>
		);
		/* eslint-enable jsx-a11y/alt-text */
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
	product: PropTypes.oneOf( [ ...getPlansSlugs(), ...getProductsSlugs() ] ).isRequired,
};
