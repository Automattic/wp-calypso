/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import {
	areProductSearchResultsLoaded,
	areProductSearchResultsLoading,
} from 'woocommerce/state/sites/products/selectors';
import { getProductSearchResults } from 'woocommerce/state/ui/products/selectors';
import ProductItem from './item';

class ProductSearchResults extends Component {
	static propTypes = {
		onSelect: PropTypes.func.isRequired,
		search: PropTypes.string.isRequired,
	};

	renderLoading = () => {
		return (
			<div className="product-search__results is-placeholder">
				<CompactCard className="product-search__item">
					<div className="product-search__image">
						<span />
					</div>
					<div className="product-search__label">
						<div className="product-search__name">
							<span />
						</div>
						<div className="product-search__sku">
							<span />
						</div>
					</div>
				</CompactCard>
			</div>
		);
	};

	renderNotFound = () => {
		const { translate } = this.props;
		return (
			<CompactCard className="product-search__item">
				<div className="product-search__image">
					<Gridicon icon="info-outline" />
				</div>
				<div className="product-search__label">
					<div className="product-search__name">{ translate( 'No products found' ) }</div>
					<div className="product-search__sku">{ translate( 'Please try another search' ) }</div>
				</div>
			</CompactCard>
		);
	};

	render() {
		const { isLoaded, isLoading, onSelect, products, search } = this.props;
		if ( ! isLoaded && ! search ) {
			return null;
		}

		if ( isLoading ) {
			return this.renderLoading();
		}

		const classes = classNames( {
			'product-search__results': true,
			'is-not-found': ! products.length,
		} );

		return (
			<div className={ classes }>
				{ products.length ? (
					products.map( p => <ProductItem key={ p.id } product={ p } onClick={ onSelect } /> )
				) : (
					this.renderNotFound()
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
