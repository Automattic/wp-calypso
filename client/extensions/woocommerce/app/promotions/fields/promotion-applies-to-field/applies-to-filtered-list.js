/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import warn from 'lib/warn';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormCheckbox from 'components/forms/form-checkbox';
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

function addProductId( appliesTo, productId ) {
	const productIds = ( appliesTo ? appliesTo.productIds : [] );
	const newProductIds = [ ...productIds, productId ];
	return { ...appliesTo, productIds: newProductIds };
}

function removeProductId( appliesTo, productId ) {
	const productIds = ( appliesTo ? appliesTo.productIds : [] );
	const newProductIds = productIds.filter( ( id ) => id !== productId );
	return { ...appliesTo, productIds: newProductIds };
}

function renderImage( images ) {
	const featuredImage = images && images[ 0 ];
	const imageClasses = classNames( 'fields__product-list-image', {
		'is-thumb-placeholder': ! featuredImage,
	} );

	return (
		<span className={ imageClasses }>
			{ featuredImage && <img src={ featuredImage.src } /> }
		</span>
	);
}

function renderRow( component, rowText, rowValue, images, selected, onChange ) {
	const labelId = `applies-to-row-${ rowValue }-label`;

	const rowComponent = React.createElement( component, {
		htmlFor: labelId,
		name: 'applies_to_select',
		value: rowValue,
		checked: selected,
		onChange: onChange,
	} );

	return (
		<div className="promotion-applies-to-field__row" key={ rowValue }>
			<FormLabel id={ labelId }>
				{ rowComponent }
				{ renderImage( images ) }
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

	renderSearch( appliesToType, searchFilter ) {
		if ( 'all' === appliesToType ) {
			return null;
		}

		return (
			<Search value={ searchFilter } onSearch={ this.onSearch } />
		);
	}

	renderList( appliesToType, singular ) {
		switch ( appliesToType ) {
			case 'all':
				return null;
			case 'productIds':
				return this.renderProductList( singular );
			case 'productCategoryIds':
				return <div>categories</div>;
			case null:
				// TODO: Add placeholder?
				return null;
			default:
				warn( 'Unrecognized appliesToType: ', appliesToType );
				return null;
		}
	}

	renderProductList( singular ) {
		const filteredProducts = this.getFilteredProducts() || [];
		const renderFunc = ( singular ? this.renderProductRadio : this.renderProductCheckbox );

		return (
			<div className="promotion-applies-to-field__list">
				{ filteredProducts.map( renderFunc ) }
			</div>
		);
	}

	renderProductCheckbox = ( product ) => {
		const { value } = this.props;
		const { name, id, images } = product;
		const selected = isProductSelected( value, product.id );

		return renderRow( FormCheckbox, name, id, images, selected, this.onCheckboxChange );
	}

	renderProductRadio = ( product ) => {
		const { value } = this.props;
		const { name, id, images } = product;
		const selected = isProductSelected( value, product.id );

		return renderRow( FormRadio, name, id, images, selected, this.onRadioChange );
	}

	onSearch = ( searchFilter ) => {
		this.setState( () => ( { searchFilter } ) );
	}

	onCheckboxChange = ( e ) => {
		const { value, edit } = this.props;
		const productId = Number( e.target.value );
		const selected = isProductSelected( value, productId );
		const newValue = ( selected
			? removeProductId( value, productId )
			: addProductId( value, productId )
		);
		edit( 'appliesTo', newValue );
	}

	onRadioChange = ( e ) => {
		const { edit } = this.props;
		const productId = Number( e.target.value );
		edit( 'appliesTo', { productIds: [ productId ] } );
	}

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
	const siteId = ( site ? site.ID : null );
	const products = getPromotionableProducts( state, siteId );
	const productCategories = getProductCategories( state, siteId );

	return {
		products,
		productCategories,
	};
}

export default connect( mapStateToProps )( AppliesToFilteredList );

