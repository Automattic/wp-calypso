/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import ProductCardPriceGroup from './price-group';

const ProductCardOption = props => {
	const {
		billingTimeFrame,
		checked,
		currencyCode,
		discountedPrice,
		fullPrice,
		onChange,
		title,
	} = props;

	return (
		<FormLabel className="product-card__option">
			<FormRadio checked={ checked } onChange={ onChange } />
			<div className="product-card__option-description">
				<div className="product-card__option-name">{ title }</div>
				<ProductCardPriceGroup
					billingTimeFrame={ billingTimeFrame }
					currencyCode={ currencyCode }
					discountedPrice={ discountedPrice }
					fullPrice={ fullPrice }
				/>
			</div>
		</FormLabel>
	);
};

ProductCardOption.propTypes = {
	billingTimeFrame: PropTypes.string,
	checked: PropTypes.bool,
	currencyCode: PropTypes.string,
	discountedPrice: PropTypes.oneOfType( [
		PropTypes.number,
		PropTypes.arrayOf( PropTypes.number ),
	] ),
	fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
	onChange: PropTypes.func,
	slug: PropTypes.string.isRequired,
	title: PropTypes.string,
};

export default ProductCardOption;
