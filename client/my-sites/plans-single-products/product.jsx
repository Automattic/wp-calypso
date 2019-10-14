/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ProductOption from './product-option';
import ProductPriceGroup from './product-price-group';

class PlansSingleProduct extends Component {
	static propTypes = {
		billingTimeFrame: PropTypes.string,
		currencyCode: PropTypes.string,
		discountedPrice: PropTypes.number,
		fullPrice: PropTypes.number,
		isPlaceholder: PropTypes.bool,
		moreInfoLabel: PropTypes.string,
		onChange: PropTypes.func,
		options: PropTypes.array,
		optionsHeading: PropTypes.string,
		productDescription: PropTypes.string,
		selectedProduct: PropTypes.string,
		slug: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	renderProductDescription() {
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

	renderOptions() {
		const {
			billingTimeFrame,
			currencyCode,
			isPlaceholder,
			onChange,
			options,
			optionsHeading,
			selectedProduct,
		} = this.props;

		if ( ! options ) {
			return null;
		}

		return (
			<div className="plans-single-products__options">
				{ optionsHeading && (
					<h4 className="plans-single-products__options-heading">{ optionsHeading }</h4>
				) }
				{ options.map( option => (
					<ProductOption
						key={ option.slug }
						billingTimeFrame={ billingTimeFrame }
						currencyCode={ currencyCode }
						isChecked={ selectedProduct === option.slug }
						isPlaceholder={ isPlaceholder }
						onChange={ onChange }
						{ ...option }
					/>
				) ) }
			</div>
		);
	}

	render() {
		const {
			billingTimeFrame,
			currencyCode,
			discountedPrice,
			fullPrice,
			isPlaceholder,
			title,
		} = this.props;

		return (
			<div className="plans-single-products__card">
				<div className="plans-single-products__card-header">
					<h3 className="plans-single-products__product-name">{ title }</h3>
					<ProductPriceGroup
						billingTimeFrame={ billingTimeFrame }
						currencyCode={ currencyCode }
						discountedPrice={ discountedPrice }
						fullPrice={ fullPrice }
						isPlaceholder={ isPlaceholder }
					/>
				</div>
				<div className="plans-single-products__card-content">
					{ this.renderProductDescription() }
					{ this.renderOptions() }
				</div>
			</div>
		);
	}
}

export default PlansSingleProduct;
