/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
	static propTypes = {
		onSelect: PropTypes.func.isRequired,
	};

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

	onSelect = product => {
		const { siteId } = this.props;
		// Clear the search field
		this.setState( { query: '' } );
		this.props.clearProductSearch( siteId );
		this.refs.searchCard.clear();

		// Pass products back to parent component
		this.props.onSelect( {
			product_id: product.id,
			quantity: 1,
		} );
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="product-search">
				<SearchCard
					ref="searchCard"
					onSearch={ this.onSearch }
					delaySearch
					delayTimeout={ 400 }
					placeholder={ translate( 'Search products…' ) }
				/>
				<ProductSearchResults search={ this.state.query } onSelect={ this.onSelect } />
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
