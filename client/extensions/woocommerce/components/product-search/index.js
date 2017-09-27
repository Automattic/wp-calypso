/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import {
	fetchProductSearchResults,
	clearProductSearch,
} from 'woocommerce/state/sites/products/actions';
import ProductSearchResults from './results';
import SearchCard from 'components/search-card';

class ProductSearch extends Component {
	state = {
		query: '',
	};

	onSearch = query => {
		const { siteId } = this.props;

		if ( trim( query ) === '' ) {
			this.setState( { query: '' } );
			this.props.clearProductSearch( siteId );
			return;
		}

		this.setState( { query } );
		this.props.fetchProductSearchResults( siteId, 1, query );
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="product-search">
				<SearchCard
					onSearch={ this.onSearch }
					delaySearch
					delayTimeout={ 400 }
					placeholder={ translate( 'Search products…' ) }
				/>
				<ProductSearchResults search={ this.state.query } />
			</div>
		);
	}
}

export default connect( null, dispatch =>
	bindActionCreators(
		{
			fetchProductSearchResults,
			clearProductSearch,
		},
		dispatch
	)
)( localize( ProductSearch ) );
