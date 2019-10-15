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
		description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		discountedPrice: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.arrayOf( PropTypes.number ),
		] ),
		fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		isPurchased: PropTypes.bool,
		subtitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	};

	renderHeader() {
		const {
			billingTimeFrame,
			currencyCode,
			discountedPrice,
			fullPrice,
			isPurchased,
			subtitle,
			title,
		} = this.props;

		return (
			<div className="single-product-plan__header">
				{ title && (
					<div className="single-product-plan__header-primary">
						<h3 className="single-product-plan__title">{ title }</h3>
					</div>
				) }
				<div className="single-product-plan__header-secondary">
					{ subtitle && <div className="single-product-plan__subtitle">{ subtitle }</div> }
					{ ! isPurchased && (
						<SingleProductPlanPriceGroup
							billingTimeFrame={ billingTimeFrame }
							currencyCode={ currencyCode }
							discountedPrice={ discountedPrice }
							fullPrice={ fullPrice }
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
