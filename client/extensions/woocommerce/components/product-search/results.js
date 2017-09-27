/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import {
	areProductSearchResultsLoaded,
	areProductSearchResultsLoading,
} from 'woocommerce/state/sites/products/selectors';
import { getProductSearchResults } from 'woocommerce/state/ui/products/selectors';
import ProductItem from './item';

class ProductSearchResults extends Component {
	static propTypes = {
		search: PropTypes.string.isRequired,
	};

	render() {
		const { isLoaded, isLoading, onSelect, products, search, translate } = this.props;
		if ( ( ! isLoaded && ! search ) || isLoading ) {
			return null;
		}

		return (
			<div className="product-search__results">
				{ products.length ? (
					products.map( p => <ProductItem key={ p.id } product={ p } onClick={ onSelect } /> )
				) : (
					<Card>{ translate( 'No results for %(search)s', { args: { search } } ) }</Card>
				) }
			</div>
		);
	}
}
export default connect( ( state, props ) => {
	const query = {
		page: 1,
		per_page: 10,
		search: props.search,
	};

	return {
		isLoaded: areProductSearchResultsLoaded( state, query ),
		isLoading: areProductSearchResultsLoading( state, query ),
		products: getProductSearchResults( state ) || [],
	};
} )( localize( ProductSearchResults ) );
