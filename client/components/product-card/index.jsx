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
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import ProductCardPriceGroup from './price-group';

/**
 * Style dependencies
 */
import './style.scss';

class ProductCard extends Component {
	static propTypes = {
		billingTimeFrame: PropTypes.string,
		checked: PropTypes.bool,
		currencyCode: PropTypes.string,
		description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		discountedPrice: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.arrayOf( PropTypes.number ),
		] ),
		fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		isPurchased: PropTypes.bool,
		onSelect: PropTypes.func,
		subtitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	};

	renderHeader() {
		const {
			billingTimeFrame,
			checked,
			currencyCode,
			discountedPrice,
			fullPrice,
			isPurchased,
			onSelect,
			subtitle,
			title,
		} = this.props;

		return (
			<div className="product-card__header">
				{ checked !== undefined && (
					<FormLabel>
						<FormCheckbox
							className="product-card__checkbox"
							checked={ checked }
							onChange={ onSelect }
							readOnly={ ! onSelect }
						/>
					</FormLabel>
				) }
				{ title && (
					<div className="product-card__header-primary">
						<h3 className="product-card__title">{ title }</h3>
					</div>
				) }
				<div className="product-card__header-secondary">
					{ subtitle && <div className="product-card__subtitle">{ subtitle }</div> }
					{ ! isPurchased && (
						<ProductCardPriceGroup
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

		const cardClassNames = classNames( 'product-card', {
			'is-purchased': isPurchased,
		} );

		return (
			<Card className={ cardClassNames }>
				{ this.renderHeader() }
				{ description && <p className="product-card__description">{ description }</p> }
			</Card>
		);
	}
}

export default ProductCard;
