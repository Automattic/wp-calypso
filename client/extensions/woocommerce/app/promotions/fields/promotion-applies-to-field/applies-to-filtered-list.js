/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { sortBy } from 'lodash';
import warn from 'lib/warn';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
import { areProductsLoading, getAllProducts } from 'woocommerce/state/sites/products/selectors';
import { getAllProductCategories } from 'woocommerce/state/sites/product-categories/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Search from 'components/search';

function categoryContainsString( category, textString ) {
	const matchString = textString.trim().toLocaleLowerCase();

	if ( -1 < category.label.toLocaleLowerCase().indexOf( matchString ) ) {
		// found in category name
		return true;
	}
	return false;
}

function productContainsString( product, textString ) {
	const matchString = textString.trim().toLocaleLowerCase();

	if ( -1 < product.name.toLocaleLowerCase().indexOf( matchString ) ) {
		// found in product name
		return true;
	}
	return false;
}

function isCategorySelected( appliesTo, categoryId ) {
	if ( ! appliesTo || ! appliesTo.productCategoryIds ) {
		return false;
	}
	return -1 !== appliesTo.productCategoryIds.indexOf( categoryId );
}

function isProductSelected( appliesTo, productId ) {
	if ( ! appliesTo || ! appliesTo.productIds ) {
		return false;
	}
	return -1 !== appliesTo.productIds.indexOf( productId );
}

function addCategoryId( appliesTo, categoryId ) {
	const categoryIds = appliesTo ? appliesTo.productCategoryIds : [];
	const newCategoryIds = [ ...categoryIds, categoryId ];
	return { ...appliesTo, productCategoryIds: newCategoryIds };
}

function removeCategoryId( appliesTo, categoryId ) {
	const categoryIds = appliesTo ? appliesTo.productCategoryIds : [];
	const newCategoryIds = categoryIds.filter( ( id ) => id !== categoryId );
	return { ...appliesTo, productCategoryIds: newCategoryIds };
}

function addProductId( appliesTo, productId ) {
	const productIds = appliesTo ? appliesTo.productIds : [];
	const newProductIds = [ ...productIds, productId ];
	return { ...appliesTo, productIds: newProductIds };
}

function removeProductId( appliesTo, productId ) {
	const productIds = appliesTo ? appliesTo.productIds : [];
	const newProductIds = productIds.filter( ( id ) => id !== productId );
	return { ...appliesTo, productIds: newProductIds };
}

function renderImage( imageSrc ) {
	const imageClasses = classNames( 'promotion-applies-to-field__list-image', {
		'is-thumb-placeholder': ! imageSrc,
	} );

	return <span className={ imageClasses }>{ imageSrc && <img src={ imageSrc } alt="" /> }</span>;
}

function renderRow( component, rowText, rowValue, imageSrc, selected, onChange ) {
	const labelId = `applies-to-row-${ rowValue }-label`;

	const rowComponent = React.createElement( component, {
		id: labelId,
		name: 'applies_to_select',
		value: rowValue,
		checked: selected,
		onChange: onChange,
	} );

	return (
		<div className="promotion-applies-to-field__row" key={ rowValue }>
			<FormLabel htmlFor={ labelId }>
				{ rowComponent }
				{ renderImage( imageSrc ) }
				<span>{ rowText }</span>
			</FormLabel>
		</div>
	);
}

class AppliesToFilteredList extends React.Component {
	static propTypes = {
		appliesToType: PropTypes.string,
		singular: PropTypes.bool,
		value: PropTypes.object,
		edit: PropTypes.func.isRequired,
		products: PropTypes.array,
		productCategories: PropTypes.array,
		currency: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			searchFilter: '',
		};
	}

	getFilteredCategories() {
		const { productCategories, value } = this.props;
		const { searchFilter } = this.state;

		if ( 0 === searchFilter.length ) {
			return sortBy( productCategories, 'label' );
		}

		const filteredCategories =
			productCategories &&
			productCategories.filter(
				( category ) =>
					categoryContainsString( category, searchFilter ) ||
					isCategorySelected( value, category.id )
			);

		return sortBy( filteredCategories, 'label' );
	}

	getFilteredProducts() {
		const { value, products } = this.props;
		const { searchFilter } = this.state;

		if ( 0 === searchFilter.length ) {
			return products;
		}

		return (
			products &&
			products.filter( ( product ) => {
				return (
					productContainsString( product, searchFilter ) || isProductSelected( value, product.id )
				);
			} )
		);
	}

	renderSearch( appliesToType, searchFilter ) {
		if ( 'all' === appliesToType ) {
			return null;
		}

		return <Search value={ searchFilter } onSearch={ this.onSearch } />;
	}

	renderList( appliesToType, singular ) {
		switch ( appliesToType ) {
			case 'all':
				return null;
			case 'productIds':
				return this.renderProductList( singular );
			case 'productCategoryIds':
				return this.renderCategoryList();
			case null:
				// TODO: Add placeholder?
				return null;
			default:
				warn( 'Unrecognized appliesToType: ', appliesToType );
				return null;
		}
	}

	renderCategoryList() {
		const filteredCategories = this.getFilteredCategories() || [];

		return (
			<div className="promotion-applies-to-field__list">
				{ filteredCategories.map( this.renderCategoryCheckbox ) }
			</div>
		);
	}

	renderProductList( singular, currency ) {
		const filteredProducts = this.getFilteredProducts() || [];
		const renderFunc = singular
			? this.renderProductRadio( currency )
			: this.renderProductCheckbox( currency );

		return (
			<div className="promotion-applies-to-field__list">{ filteredProducts.map( renderFunc ) }</div>
		);
	}

	renderCategoryCheckbox = ( category ) => {
		const { value } = this.props;
		const { label, id, image } = category;
		const selected = isCategorySelected( value, id );
		const imageSrc = image && image.src;

		return renderRow( FormCheckbox, label, id, imageSrc, selected, this.onCategoryCheckbox );
	};

	renderProductCheckbox = ( currency ) => ( product ) => {
		const { value } = this.props;
		const { name, regular_price, id, images } = product;
		const nameWithPrice = name + ' - ' + formatCurrency( regular_price, currency );
		const selected = isProductSelected( value, id );
		const image = images && images[ 0 ];
		const imageSrc = image && image.src;

		return renderRow( FormCheckbox, nameWithPrice, id, imageSrc, selected, this.onProductCheckbox );
	};

	renderProductRadio = ( currency ) => ( product ) => {
		const { value } = this.props;
		const { name, regular_price, id, images } = product;
		const nameWithPrice = name + ' - ' + formatCurrency( regular_price, currency );
		const selected = isProductSelected( value, product.id );
		const image = images && images[ 0 ];
		const imageSrc = image && image.src;

		return renderRow( FormRadio, nameWithPrice, id, imageSrc, selected, this.onProductRadio );
	};

	onSearch = ( searchFilter ) => {
		this.setState( () => ( { searchFilter } ) );
	};

	onCategoryCheckbox = ( e ) => {
		const { value, edit } = this.props;
		const categoryId = Number( e.target.value );
		const selected = isCategorySelected( value, categoryId );
		const newValue = selected
			? removeCategoryId( value, categoryId )
			: addCategoryId( value, categoryId );
		edit( 'appliesTo', newValue );
	};

	onProductCheckbox = ( e ) => {
		const { value, edit } = this.props;
		const productId = Number( e.target.value );
		const selected = isProductSelected( value, productId );
		const newValue = selected
			? removeProductId( value, productId )
			: addProductId( value, productId );
		edit( 'appliesTo', newValue );
	};

	onProductRadio = ( e ) => {
		const { edit } = this.props;
		const productId = Number( e.target.value );
		edit( 'appliesTo', { productIds: [ productId ] } );
	};

	render() {
		const { appliesToType, singular } = this.props;
		const { searchFilter } = this.state;

		return (
			<div className="promotion-applies-to-field__filtered-list">
				{ this.renderSearch( appliesToType, searchFilter ) }
				{ this.renderList( appliesToType, singular ) }
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;
	const productsLoading = areProductsLoading( state, siteId );
	const products = productsLoading ? null : getAllProducts( state, siteId );
	const productCategories = getAllProductCategories( state, siteId );

	// TODO: This is temporary, as it's not used anymore.
	const nonVariableProducts =
		! productsLoading && products.filter( ( product ) => 'variable' !== product.type );

	return {
		products: nonVariableProducts,
		productCategories,
	};
}

export default connect( mapStateToProps )( AppliesToFilteredList );
