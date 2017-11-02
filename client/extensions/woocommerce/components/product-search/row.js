/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
import ProductVariations from './variations';

function renderImage( imageSrc ) {
	const imageClasses = classNames( 'product-search__list-image', {
		'is-thumb-placeholder': ! imageSrc,
	} );

	return <span className={ imageClasses }>{ imageSrc && <img src={ imageSrc } /> }</span>;
}

class ProductSearchRow extends Component {
	static propTypes = {
		isSelected: PropTypes.bool,
		onChange: PropTypes.func,
		product: PropTypes.object.isRequired,
		singular: PropTypes.bool,
	};

	static defaultProps = {
		isSelected: false,
		onChange: noop,
		singular: false,
	};

	updateItem = () => {
		// console.log( attributes );
	};

	renderRow = ( component, rowText, rowValue, imageSrc, selected, onChange ) => {
		const labelId = `applies-to-row-${ rowValue }-label`;

		const rowComponent = React.createElement( component, {
			htmlFor: labelId,
			name: 'applies_to_select',
			value: rowValue,
			checked: selected,
			onChange: onChange,
		} );

		return (
			<div className="product-search__row" key={ rowValue }>
				<FormLabel id={ labelId }>
					{ rowComponent }
					{ renderImage( imageSrc ) }
					<span>{ rowText }</span>
				</FormLabel>
				{ selected && (
					<ProductVariations product={ this.props.product } onChange={ this.updateItem } />
				) }
			</div>
		);
	};

	render() {
		const { product, isSelected } = this.props;
		const { name, id, images } = product;
		const image = images && images[ 0 ];
		const imageSrc = image && image.src;
		const component = this.props.singular ? FormRadio : FormCheckbox;

		return this.renderRow( component, name, id, imageSrc, isSelected, this.props.onChange );
	}
}

export default ProductSearchRow;
