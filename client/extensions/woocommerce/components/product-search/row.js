/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { filter, find, get, intersection, noop, reduce, uniqBy, values } from 'lodash';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Count from 'components/count';
import { fetchProductVariations } from 'woocommerce/state/sites/product-variations/actions';
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getVariationsForProduct } from 'woocommerce/state/sites/product-variations/selectors';
import { areVariationsSelected, isProductSelected, isVariableProduct } from './utils';
import ProductVariations from './variations';
import ImageThumb from 'woocommerce/components/image-thumb';

class ProductSearchRow extends Component {
	static propTypes = {
		onChange: PropTypes.func,
		product: PropTypes.object.isRequired,
		singular: PropTypes.bool,
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.array ] ),
	};

	static defaultProps = {
		onChange: noop,
		singular: false,
	};

	constructor( props ) {
		super( props );
		this.state = {
			showForm: false,
			variations: [],
		};
	}

	componentDidMount() {
		const { siteId, product, productId } = this.props;

		if ( siteId && productId ) {
			if ( ! product || 'variable' !== product.type ) {
				return;
			}
			this.props.fetchProductVariations( siteId, productId );
		}
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		// Short out if we know the new product doesn't need variations
		if ( ! newProps.product || 'variable' !== newProps.product.type ) {
			return;
		}

		const { siteId: oldSiteId, productId: oldProductId } = this.props;
		const { siteId: newSiteId, productId: newProductId } = newProps;

		if ( oldSiteId !== newSiteId || oldProductId !== newProductId ) {
			this.props.fetchProducts( newSiteId, newProductId );
		}

		const selectedIds = intersection( newProps.value, newProps.product.variations );
		const selectedVariations = selectedIds.map( ( id ) => find( newProps.variations, { id } ) );
		this.setState( {
			variations: filter( selectedVariations ) || [],
		} );
	}

	isSelected = ( id ) => isProductSelected( this.props.value, id );

	onChange = ( event ) => {
		const productId = Number( event.target.value );
		this.props.onChange( productId );
	};

	toggleCustomizeForm = ( event ) => {
		// This handler can be on the label, or button with the label, so we
		// stop propagation to avoid immediate open-then-close behavior.
		event.stopPropagation();
		this.setState( ( prevState ) => ( { showForm: ! prevState.showForm } ) );
	};

	updateItem = ( attributes, callback ) => {
		const { variations } = this.props;
		// Don't swap the product if we have an "any" selected
		if ( -1 !== values( attributes ).indexOf( 'any' ) ) {
			return;
		}
		// Using filter instead of find to make sure we find exactly one match.
		const matchingVariations = filter( variations, ( v ) => {
			return reduce(
				v.attributes,
				( result, a ) => {
					return result && attributes[ a.name ] === a.option;
				},
				true
			);
		} );
		if ( matchingVariations.length === 1 ) {
			// We found a match.
			this.setState( ( prevState ) => {
				// For singular selects, we can replace the old selected variation, but for
				// multi-selects, we want to merge the new variation into the existing list
				const newVariations = this.props.singular
					? matchingVariations
					: uniqBy( [ ...prevState.variations, ...matchingVariations ], 'id' );
				return {
					variations: newVariations,
				};
			} );
			const variationId = get( matchingVariations, '[0].id', false );
			if ( variationId && ! this.isSelected( variationId ) ) {
				const { product } = this.props;
				this.props.onChange( variationId, product.id );
			}
			if ( typeof callback === 'function' ) {
				callback();
			}
		}
	};

	areAnySelected = () => {
		const { product } = this.props;
		return this.isSelected( product.id ) || areVariationsSelected( this.props.value, product );
	};

	renderSelectedVariations = () => {
		if ( ! this.state.variations.length ) {
			return null;
		}
		return this.state.variations.map( ( variation ) =>
			this.renderRow( { ...this.props.product, ...variation, isVariation: true } )
		);
	};

	renderVariations = () => {
		// None are selected, and we aren't showing the form
		if ( ! this.areAnySelected() && ! this.state.showForm ) {
			return null;
		}

		return (
			<div className="product-search__variation-selections-and-form">
				{ this.renderSelectedVariations() }
				{ this.state.showForm && (
					<ProductVariations product={ this.props.product } onChange={ this.updateItem } />
				) }
			</div>
		);
	};

	renderInputComponent = ( product ) => {
		const inputId = `product-search_select-${ product.id }`;
		const { singular } = this.props;
		const component = singular ? FormRadio : FormCheckbox;

		if ( isVariableProduct( product ) ) {
			return <Count count={ this.state.variations.length } />;
		}

		return React.createElement( component, {
			id: inputId,
			name: inputId,
			value: product.id,
			checked: this.isSelected( product.id ),
			onChange: this.onChange,
		} );
	};

	renderInputName = ( product ) => {
		const { currency, translate, showRegularPrice } = this.props;

		let price;
		if ( showRegularPrice ) {
			price = formatCurrency( product.regular_price || '0', currency );
		} else {
			price = formatCurrency( product.price, currency );
		}

		let nameWithPrice = `${ product.name } - ${ price }`;
		// Some things do need special handling…
		if ( product.isVariation ) {
			const varName = formattedVariationName( product );
			nameWithPrice = `${ product.name } - ${ varName } - ${ price }`;
		}
		if ( isVariableProduct( product ) ) {
			return (
				<span>
					<span>{ product.name }</span>
					<Button compact onClick={ this.toggleCustomizeForm }>
						{ translate( 'Select variations' ) }
					</Button>
				</span>
			);
		}
		return <span>{ nameWithPrice }</span>;
	};

	renderInputImage( product ) {
		let imageSrc = get( product, 'images[0].src', '' );
		// Check for a variation image
		if ( product.isVariation ) {
			imageSrc = get( product.image, 'src', imageSrc );
		}
		return <ImageThumb width={ 32 } height={ 32 } src={ imageSrc } alt="" />;
	}

	renderRow = ( product ) => {
		const id = product.id;
		const inputId = `product-search_select-${ id }`;

		const labelProps = {};
		if ( isVariableProduct( product ) ) {
			labelProps.onClick = this.toggleCustomizeForm;
		}

		return (
			<FormLabel htmlFor={ inputId } key={ id } { ...labelProps }>
				{ this.renderInputComponent( product ) }
				{ this.renderInputImage( product ) }
				{ this.renderInputName( product ) }
			</FormLabel>
		);
	};

	render() {
		return (
			<div className="product-search__row">
				{ this.renderRow( this.props.product ) }
				{ this.renderVariations() }
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
	( dispatch ) => bindActionCreators( { fetchProductVariations }, dispatch )
)( localize( ProductSearchRow ) );
