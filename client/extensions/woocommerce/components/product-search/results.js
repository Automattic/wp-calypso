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

class ProductSearchResults extends Component {
	static propTypes = {
		search: PropTypes.string.isRequired,
	};

	render() {
		const { isLoaded, isLoading, products, search, translate } = this.props;
		let results;
		if ( ! isLoaded && ! search ) {
			results = <p>{ translate( 'Please enter a search term.' ) }</p>;
		} else if ( isLoading ) {
			results = <p>{ translate( 'Searching…' ) }</p>;
		} else if ( ! products.length ) {
			results = <p>{ translate( 'No results for %(search)s', { args: { search } } ) }</p>;
		} else {
			results = <ul>{ products.map( p => <li key={ p.id }>{ p.name }</li> ) }</ul>;
		}
		return <Card>{ results }</Card>;
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
