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
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import ProductSearchResults from './results';
import SearchCard from 'components/search-card';

class ProductSearch extends Component {
	static propTypes = {
		onSelect: PropTypes.func.isRequired,
	};

	state = {
		query: '',
	};

	handleSearch = query => {
		const { siteId } = this.props;

		if ( trim( query ) === '' ) {
			this.setState( { query: '' } );
			return;
		}

		this.setState( { query } );
		this.props.fetchProducts( siteId, { search: query } );
	};

	handleSelect = product => {
		// Clear the search field
		this.setState( { query: '' } );
		this.refs.searchCard.clear();

		// Pass products back to parent component
		this.props.onSelect( product );
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="product-search">
				<SearchCard
					ref="searchCard"
					onSearch={ this.handleSearch }
					delaySearch
					delayTimeout={ 400 }
					placeholder={ translate( 'Search products…' ) }
				/>
				<ProductSearchResults search={ this.state.query } onSelect={ this.handleSelect } />
			</div>
		);
	}
}

export default connect( null, dispatch => bindActionCreators( { fetchProducts }, dispatch ) )(
	localize( ProductSearch )
);
