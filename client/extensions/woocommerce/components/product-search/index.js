/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { getAllProducts } from 'woocommerce/state/sites/products/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Search from 'components/search';
import ProductSearchRow from './row';

function productContainsString( product, textString ) {
	const matchString = textString.trim().toLocaleLowerCase();

	if ( -1 < product.name.toLocaleLowerCase().indexOf( matchString ) ) {
		// found in product name
		return true;
	}
	return false;
}

function isProductSelected( value = [], productId ) {
	if ( ! value.length ) {
		return false;
	}
	return -1 !== value.indexOf( productId );
}

function addProductId( value = [], productId ) {
	return [ ...value, productId ];
}

function removeProductId( value = [], productId ) {
	return value.filter( id => id !== productId );
}

class ProductSearch extends Component {
	static propTypes = {
		singular: PropTypes.bool,
		value: PropTypes.oneOfType( [ PropTypes.array, PropTypes.number ] ),
		onChange: PropTypes.func.isRequired,
		products: PropTypes.array,
	};

	constructor( props ) {
		super( props );
		this.state = {
			searchFilter: '',
		};
	}

	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.fetchProducts( siteId, { offset: 0, per_page: 50 } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { oldSiteId } = this.props;
		const { newSiteId } = newProps;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProducts( newSiteId, { offset: 0, per_page: 50 } );
		}
	}

	getFilteredProducts() {
		const { value, products } = this.props;
		const { searchFilter } = this.state;

		if ( 0 === searchFilter.length ) {
			return products;
		}

		return (
			products &&
			products.filter( product => {
				return (
					productContainsString( product, searchFilter ) || isProductSelected( value, product.id )
				);
			} )
		);
	}

	renderSearch( searchFilter ) {
		return <Search value={ searchFilter } onSearch={ this.onSearch } />;
	}

	renderList( singular ) {
		const { value } = this.props;
		const filteredProducts = this.getFilteredProducts() || [];
		const renderFunc = product => {
			const isSelected = isProductSelected( value, product.id );
			const onChange = singular ? this.onProductRadio : this.onProductCheckbox;
			return (
				<ProductSearchRow
					key={ product.id }
					isSelected={ isSelected }
					onChange={ onChange }
					product={ product }
					singular={ singular }
				/>
			);
		};

		return <div className="product-search__list">{ filteredProducts.map( renderFunc ) }</div>;
	}

	onSearch = searchFilter => {
		this.setState( { searchFilter } );
	};

	onProductCheckbox = e => {
		const productId = Number( e.target.value );
		const { value } = this.props;
		const selected = isProductSelected( value, productId );
		const newValue = selected
			? removeProductId( value, productId )
			: addProductId( value, productId );
		this.props.onChange( newValue );
	};

	onProductRadio = event => {
		const productId = Number( event.target.value );
		this.props.onChange( productId );
	};

	render() {
		const { singular } = this.props;
		const { searchFilter } = this.state;

		return (
			<div className="product-search">
				{ this.renderSearch( searchFilter ) }
				{ this.renderList( singular ) }
			</div>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : null;
		const products = getAllProducts( state, siteId );

		return {
			siteId,
			products,
		};
	},
	dispatch => bindActionCreators( { fetchProducts }, dispatch )
)( ProductSearch );
