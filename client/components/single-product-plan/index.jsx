/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SingleProductPlanPriceGroup from './price-group';

/**
 * Style dependencies
 */
import './style.scss';

class SingleProductPlan extends Component {
	static propTypes = {
		billingTimeFrame: PropTypes.string,
		currencyCode: PropTypes.string,
		description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
		discountedPrice: PropTypes.number,
		fullPrice: PropTypes.number,
		isPurchased: PropTypes.bool,
		subtitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
	};

	renderDescription() {
		const { moreInfoLabel, isPlaceholder, productDescription } = this.props;

		const productDescriptionClasses = classNames( 'plans-single-products__product-description', {
			'is-placeholder': isPlaceholder,
		} );

		const moreInfo = moreInfoLabel ? <a href="/">{ moreInfoLabel }</a> : null;

		return (
			<p className={ productDescriptionClasses }>
				{ productDescription } { moreInfo }
			</p>
		);
	}

	renderHeader() {
		const {
			billingTimeFrame,
			currencyCode,
			discountedPrice,
			discountedPriceRange,
			fullPrice,
			fullPriceRange,
			isPurchased,
			subtitle,
			title,
		} = this.props;

		return (
			<div className="single-product-plan__header">
				<div className="single-product-plan__header-primary">
					<h3 className="single-product-plan__title">{ title }</h3>
				</div>
				<div className="single-product-plan__header-secondary">
					{ isPurchased ? (
						<div className="single-product-plan__subtitle">{ subtitle }</div>
					) : (
						<SingleProductPlanPriceGroup
							billingTimeFrame={ billingTimeFrame }
							currencyCode={ currencyCode }
							discountedPrice={ discountedPrice }
							discountedPriceRange={ discountedPriceRange }
							fullPrice={ fullPrice }
							fullPriceRange={ fullPriceRange }
						/>
					) }
				</div>
			</div>
		);
	}

	render() {
		const { description, isPurchased } = this.props;

		const cardClassNames = classNames( 'single-product-plan', {
			'is-purchased': isPurchased,
		} );

		return (
			<Card className={ cardClassNames }>
				{ this.renderHeader() }
				{ description && <p className="single-product-plan__description">{ description }</p> }
			</Card>
		);
	}
}

export default SingleProductPlan;
