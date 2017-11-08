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
import { addProductId, isProductSelected, productContainsString, removeProductId } from './utils';

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
		const { siteId: oldSiteId } = this.props;
		const { siteId: newSiteId } = newProps;

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

	onSearch = searchFilter => {
		this.setState( { searchFilter } );
	};

	onProductCheckbox = productId => {
		const { value } = this.props;
		const selected = isProductSelected( value, productId );
		const newValue = selected
			? removeProductId( value, productId )
			: addProductId( value, productId );
		this.props.onChange( newValue );
	};

	onProductRadio = productId => {
		this.props.onChange( productId );
	};

	renderSearch = () => {
		return <Search value={ this.state.searchFilter } onSearch={ this.onSearch } />;
	};

	renderList = () => {
		const { singular, value } = this.props;
		const filteredProducts = this.getFilteredProducts() || [];
		const renderFunc = product => {
			const onChange = singular ? this.onProductRadio : this.onProductCheckbox;
			return (
				<ProductSearchRow
					key={ product.id }
					onChange={ onChange }
					product={ product }
					singular={ singular }
					value={ value }
				/>
			);
		};

		return <div className="product-search__list">{ filteredProducts.map( renderFunc ) }</div>;
	};

	render() {
		return (
			<div className="product-search">
				{ this.renderSearch() }
				{ this.renderList() }
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
