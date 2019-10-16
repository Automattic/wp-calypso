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
import Gridicon from 'components/gridicon';
import ProductCardPriceGroup from './price-group';
import ProductCardOption from './product-option';

/**
 * Style dependencies
 */
import './style.scss';

class ProductCard extends Component {
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
			<div className="product-card__header">
				{ title && (
					<div className="product-card__header-primary">
						{ isPurchased && <Gridicon icon="checkmark" size={ 18 } /> }
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

	renderOptions() {
		const {
			billingTimeFrame,
			currencyCode,
			handleSelect,
			options,
			optionsLabel,
			selectedSlug,
		} = this.props;

		if ( ! options ) {
			return null;
		}

		return (
			<div className="product-card__options">
				{ optionsLabel && <h4 className="product-card__options-label">{ optionsLabel }</h4> }
				{ options.map( option => (
					<ProductCardOption
						key={ `product-option-${ option.slug }` }
						billingTimeFrame={ billingTimeFrame }
						checked={ option.slug === selectedSlug }
						currencyCode={ currencyCode }
						onChange={ () => handleSelect( option.slug ) }
						{ ...option }
					/>
				) ) }
			</div>
		);
	}

	render() {
		const { description, isPlaceholder, isPurchased } = this.props;

		const cardClassNames = classNames( 'product-card', {
			'is-placeholder': isPlaceholder,
			'is-purchased': isPurchased,
		} );

		return (
			<Card className={ cardClassNames }>
				{ this.renderHeader() }
				{ description && <p className="product-card__description">{ description }</p> }
				{ this.renderOptions() }
			</Card>
		);
	}
}

ProductCard.propTypes = {
	billingTimeFrame: PropTypes.string,
	currencyCode: PropTypes.string,
	description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	discountedPrice: PropTypes.oneOfType( [
		PropTypes.number,
		PropTypes.arrayOf( PropTypes.number ),
	] ),
	fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
	handleSelect: PropTypes.func,
	isPlaceholder: PropTypes.bool,
	isPurchased: PropTypes.bool,
	options: PropTypes.arrayOf(
		PropTypes.shape( {
			discountedPrice: PropTypes.oneOfType( [
				PropTypes.number,
				PropTypes.arrayOf( PropTypes.number ),
			] ),
			fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
			slug: PropTypes.string.isRequired,
			title: PropTypes.string,
		} )
	),
	optionsLabel: PropTypes.string,
	selectedSlug: PropTypes.string,
	subtitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
};

export default ProductCard;
