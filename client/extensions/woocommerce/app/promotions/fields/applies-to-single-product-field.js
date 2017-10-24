/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormField from './form-field';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import { getProductCategories } from 'woocommerce/state/sites/product-categories/selectors';
import { getPromotionableProducts } from 'woocommerce/state/selectors/promotions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Search from 'components/search';

function productContainsString( product, textString ) {
	const matchString = textString.trim().toLowerCase();

	if ( -1 < product.name.toLocaleLowerCase().indexOf( matchString ) ) {
		// found in product name
		return true;
	}

	return false;
}

function isProductSelected( appliesTo, productId ) {
	if ( ! appliesTo || ! appliesTo.productIds ) {
		return false;
	}

	return ( -1 !== appliesTo.productIds.indexOf( productId ) );
}

class AppliesToSingleProductField extends React.Component {
	static propTypes = {
		fieldName: PropTypes.string.isRequired,
		labelText: PropTypes.string.isRequired,
		explanationText: PropTypes.string,
		isRequired: PropTypes.bool.isRequired,
		value: PropTypes.object,
		edit: PropTypes.func.isRequired,
		products: PropTypes.array,
		productCategories: PropTypes.array,
	};

	constructor( props ) {
		super( props );
		this.state = {
			searchFilter: '',
		};
	}

	getFilteredProducts() {
		const { value, products } = this.props;
		const { searchFilter } = this.state;

		if ( 0 === searchFilter.length ) {
			return products;
		}

		return products && products.filter(
			( product ) => {
				return productContainsString( product, searchFilter ) ||
					isProductSelected( value, product.id );
			}
		);
	}

	renderList() {
		const filteredProducts = this.getFilteredProducts() || [];

		return (
			<div className="fields__applies-to-list">
				{ filteredProducts.map( this.renderProduct ) }
			</div>
		);
	}

	renderProduct = ( product ) => {
		const { value } = this.props;
		const labelId = `product-${ product.id }-label`;
		const selected = isProductSelected( value, product.id );

		return (
			<div className="fields__applies-to-row" key={ product.id }>
				<FormLabel id={ labelId }>
					<FormRadio
						htmlFor={ labelId }
						name="product"
						value={ product.id }
						checked={ selected }
						onChange={ this.onRadioChange }
					/>
					{ this.renderImage( product ) }
					<span>{ product.name }</span>
				</FormLabel>
			</div>
		);
	}

	renderImage( product ) {
		const featuredImage = product.images && product.images[ 0 ];
		const imageClasses = classNames( 'fields__product-list-image', {
			'is-thumb-placeholder': ! featuredImage,
		} );

		return (
			<span className={ imageClasses }>
				{ featuredImage && <img src={ featuredImage.src } /> }
			</span>
		);
	}

	onSearch = ( searchFilter ) => {
		this.setState( () => ( { searchFilter } ) );
	}

	onRadioChange = ( e ) => {
		const { edit } = this.props;
		const productId = Number( e.target.value );
		edit( 'appliesTo', { productIds: [ productId ] } );
	}

	render() {
		const {
			fieldName,
			labelText,
			explanationText,
			isRequired,
		} = this.props;
		const { searchFilter } = this.state;

		return (
			<div className="fields__applies-to">
				<FormField
					fieldName={ fieldName }
					labelText={ labelText }
					explanationText={ explanationText }
					isRequired={ isRequired }
				>
					<Search value={ searchFilter } onSearch={ this.onSearch } />
					{ this.renderList() }
				</FormField>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = ( site ? site.ID : null );
	const products = getPromotionableProducts( state, siteId );
	const productCategories = getProductCategories( state, siteId );

	return {
		products,
		productCategories,
	};
}

export default connect( mapStateToProps )( AppliesToSingleProductField );

