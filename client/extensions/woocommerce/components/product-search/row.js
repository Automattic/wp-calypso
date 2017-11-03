/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchProductVariations } from 'woocommerce/state/sites/product-variations/actions';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getVariationsForProduct } from 'woocommerce/state/sites/product-variations/selectors';
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

	componentDidMount() {
		const { siteId, product, productId } = this.props;

		if ( siteId && productId ) {
			if ( ! product || 'variable' !== product.type ) {
				return;
			}
			this.props.fetchProductVariations( siteId, productId );
		}
	}

	componentWillReceiveProps( newProps ) {
		// Short out if we know the new product doesn't need variations
		if ( ! newProps.product || 'variable' !== newProps.product.type ) {
			return;
		}

		const { oldSiteId, oldProductId } = this.props;
		const { newSiteId, newProductId } = newProps;

		if ( oldSiteId !== newSiteId || oldProductId !== newProductId ) {
			this.props.fetchProducts( newSiteId, newProductId );
		}
	}

	updateItem = attributes => {
		const { onChange, variations } = this.props;
		onChange( attributes, variations );
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

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : null;
		const productId = props.product.id;
		const variations = getVariationsForProduct( state, productId );

		return {
			siteId,
			productId,
			variations,
		};
	},
	dispatch => bindActionCreators( { fetchProductVariations }, dispatch )
)( ProductSearchRow );
