/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { filter, get, head, noop, reduce, values } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchProductVariations } from 'woocommerce/state/sites/product-variations/actions';
import formatCurrency from 'lib/format-currency';
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
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

	state = {
		variation: false,
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
		const { variations } = this.props;
		// Don't swap the product if we have an "any" selected
		if ( -1 !== values( attributes ).indexOf( 'any' ) ) {
			this.setState( { variation: false } );
			return;
		}
		// Using filter instead of find to make sure we find exactly one match.
		const variation = filter( variations, v => {
			return reduce(
				v.attributes,
				( result, a ) => {
					return result && attributes[ a.name ] === a.option;
				},
				true
			);
		} );
		if ( variation.length === 1 ) {
			// We found a match.
			this.setState( { variation: head( variation ) } );
			return;
		}
	};

	render() {
		const { currency, product, isSelected } = this.props;
		const { id, images, name, price } = product;
		let nameWithPrice = name + ' - ' + formatCurrency( price, currency );
		let imageSrc = get( images, '[0].src', false );
		const labelId = `product-search-row-${ id }-label`;
		const component = this.props.singular ? FormRadio : FormCheckbox;

		const { variation } = this.state;
		if ( variation ) {
			const varName = formattedVariationName( variation );
			const varPrice = formatCurrency( variation.price, currency );
			nameWithPrice = `${ name } - ${ varName } - ${ varPrice }`;
			imageSrc = get( variation.image, 'src', imageSrc );
		}

		const inputComponent = React.createElement( component, {
			htmlFor: labelId,
			name: `product-search_select-${ id }`,
			value: id,
			checked: isSelected,
			onChange: this.props.onChange,
		} );

		return (
			<div className="product-search__row" key={ id }>
				<FormLabel id={ labelId }>
					{ inputComponent }
					{ renderImage( imageSrc ) }
					<span>{ nameWithPrice }</span>
				</FormLabel>
				{ isSelected && (
					<ProductVariations product={ this.props.product } onChange={ this.updateItem } />
				) }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : null;
		const productId = props.product.id;
		const variations = getVariationsForProduct( state, productId );
		const currencySettings = getPaymentCurrencySettings( state, siteId );
		const currency = currencySettings ? currencySettings.value : null;

		return {
			currency,
			siteId,
			productId,
			variations,
		};
	},
	dispatch => bindActionCreators( { fetchProductVariations }, dispatch )
)( ProductSearchRow );
