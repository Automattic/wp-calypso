/** @format */
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
import { areProductSearchResultsLoading } from 'woocommerce/state/sites/products/selectors';
import {
	fetchProductSearchResults,
	clearProductSearch,
} from 'woocommerce/state/sites/products/actions';
import { getProductSearchResults } from 'woocommerce/state/ui/products/selectors';
import { getProductSearchQuery } from 'woocommerce/state/sites/products/selectors';

import ProductSearchField from './search';
import ProductSearchResults from './results';

class ProductSearch extends Component {
	static propTypes = {
		clearProductSearch: PropTypes.func,
		fetchProductSearchResults: PropTypes.func,
		onSelect: PropTypes.func.isRequired,
		selected: PropTypes.array,
		translate: PropTypes.func,
	};

	state = {
		currentSearch: '',
		tokens: [ 'Mug' ],
	};

	componentDidMount() {
		const { siteId } = this.props;
		this.props.fetchProductSearchResults( siteId, 1, '' );
	}

	componentWillReceiveProps( newProps ) {
		const { siteId } = newProps;
		if ( this.props.siteId !== siteId ) {
			this.props.fetchProductSearchResults( siteId, 1, '' );
		}
	}

	handleSearch = query => {
		this.setState( { currentSearch: query } );
		// @todo Debounce this
		const { siteId } = this.props;
		this.props.fetchProductSearchResults( siteId, 1, query );
	};

	addToken = token => {
		this.setState( prevState => ( {
			currentSearch: '',
			tokens: [ ...prevState.tokens, token ],
		} ) );
	};

	updateTokens = tokens => {
		this.setState( { tokens } );
	};

	getProductResults = () => {
		const { isLoading, products } = this.props;
		if ( isLoading || ! products.length ) {
			return [];
		}

		return products;
	};

	render() {
		const { currentSearch, tokens } = this.state;
		return (
			<div className="product-search">
				<ProductSearchField
					ref="productSearch"
					currentSearch={ this.state.currentSearch }
					value={ tokens }
					onChange={ this.updateTokens }
					onInputChange={ this.handleSearch }
				/>
				<ProductSearchResults search={ currentSearch } onSelect={ this.addToken } />
			</div>
		);
	}
}

export default connect(
	state => {
		const search = getProductSearchQuery( state ) || '';
		const query = {
			page: 1,
			per_page: 10,
			search,
		};

		return {
			isLoading: areProductSearchResultsLoading( state, query ),
			products: getProductSearchResults( state ) || [],
		};
	},
	dispatch =>
		bindActionCreators(
			{
				fetchProductSearchResults,
				clearProductSearch,
			},
			dispatch
		)
)( localize( ProductSearch ) );
