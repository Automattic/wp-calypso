/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { areProductsLoading, getAllProducts } from 'woocommerce/state/sites/products/selectors';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import NoResults from 'my-sites/no-results';
import Search from 'components/search';
import ProductSearchRow from './row';
import {
	addProductId,
	areVariationsSelected,
	isProductSelected,
	productContainsString,
	removeProductId,
} from './utils';

class ProductSearch extends Component {
	static propTypes = {
		singular: PropTypes.bool,
		showRegularPrice: PropTypes.bool,
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
		const { siteId, query } = this.props;

		if ( siteId ) {
			this.props.fetchProducts( siteId, query );
		}
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		const { siteId: oldSiteId } = this.props;
		const { siteId: newSiteId, query } = newProps;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProducts( newSiteId, query );
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
			products.filter( ( product ) => {
				return (
					productContainsString( product, searchFilter ) ||
					isProductSelected( value, product.id ) ||
					areVariationsSelected( value, product )
				);
			} )
		);
	}

	onSearch = ( searchFilter ) => {
		this.setState( { searchFilter } );
	};

	onProductCheckbox = ( productId ) => {
		const { value } = this.props;
		const selected = isProductSelected( value, productId );
		const newValue = selected
			? removeProductId( value, productId )
			: addProductId( value, productId );
		this.props.onChange( newValue );
	};

	onProductRadio = ( productId, parentId ) => {
		this.props.onChange( productId, parentId );
	};

	renderSearch = () => {
		return <Search value={ this.state.searchFilter } onSearch={ this.onSearch } />;
	};

	renderNoProducts = () => {
		const { translate, site } = this.props;
		const text = translate( "You don't have any products yet – {{a}}Add a product{{/a}}", {
			components: {
				a: <a href={ getLink( '/store/product/:site/', site ) } />,
			},
		} );
		return (
			<div className="product-search__list">
				<div className="product-search__row is-empty">
					<div className="product-search__row-item">
						<NoResults text={ text } image="/calypso/images/pages/illustration-pages.svg" />
					</div>
				</div>
			</div>
		);
	};

	renderPlaceholder = () => {
		return (
			<div className="product-search__list">
				<div className="product-search__row is-placeholder">
					<div className="product-search__row-item">
						<input type="checkbox" disabled />
						<span className="product-search__list-image is-thumb-placeholder" />
						<span className="product-search__row-title" />
					</div>
				</div>
			</div>
		);
	};

	renderList = () => {
		const { isLoading, products, singular, value, showRegularPrice } = this.props;
		if ( isLoading ) {
			return this.renderPlaceholder();
		}
		if ( ! products.length ) {
			return this.renderNoProducts();
		}

		const filteredProducts = this.getFilteredProducts() || [];
		const renderFunc = ( product ) => {
			const onChange = singular ? this.onProductRadio : this.onProductCheckbox;
			return (
				<ProductSearchRow
					key={ product.id }
					onChange={ onChange }
					product={ product }
					singular={ singular }
					showRegularPrice={ showRegularPrice }
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
	( state ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : null;
		const query = { per_page: 50, offset: 0 };
		const products = getAllProducts( state, siteId );
		const isLoading = areProductsLoading( state, query, siteId );

		return {
			isLoading,
			site, // Needed for getLink
			siteId,
			query,
			products,
		};
	},
	( dispatch ) => bindActionCreators( { fetchProducts }, dispatch )
)( localize( ProductSearch ) );
