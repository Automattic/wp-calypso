/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import ProductPriceGroup from './product-price-group';

class PlansSingleProductOption extends Component {
	static propTypes = {
		billingTimeFrame: PropTypes.string,
		currencyCode: PropTypes.string,
		discountedPrice: PropTypes.number,
		fullPrice: PropTypes.number,
		isChecked: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		onChange: PropTypes.func,
		slug: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		isChecked: false,
		isPlaceholder: false,
	};

	handleSelect() {
		const { onSelect, slug } = this.props;
		onSelect( slug );
	}

	render() {
		const {
			billingTimeFrame,
			currencyCode,
			discountedPrice,
			fullPrice,
			isChecked,
			isPlaceholder,
			onChange,
			title,
		} = this.props;

		return (
			<FormLabel className="plans-single-products__option">
				<FormRadio checked={ isChecked } onChange={ onChange } />
				<div className="plans-single-products__option-description">
					<div className="plans-single-products__option-name">{ title }</div>
					<ProductPriceGroup
						billingTimeFrame={ billingTimeFrame }
						currencyCode={ currencyCode }
						discountedPrice={ discountedPrice }
						fullPrice={ fullPrice }
						isPlaceholder={ isPlaceholder }
					/>
				</div>
			</FormLabel>
		);
	}
}

export default PlansSingleProductOption;
