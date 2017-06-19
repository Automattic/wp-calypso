/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import EmptyContent from 'components/empty-content';
import { fetchProducts, fetchProductSearchResults, clearProductSearch } from 'woocommerce/state/sites/products/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	getTotalProducts,
	areProductsLoaded,
	getTotalProductSearchResults,
	areProductSearchResultsLoaded,
} from 'woocommerce/state/sites/products/selectors';
import {
	getProductListCurrentPage,
	getProductListProducts,
	getProductListRequestedPage,
	getProductSearchCurrentPage,
	getProductSearchResults,
	getProductSearchRequestedPage,
} from 'woocommerce/state/ui/products/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import Pagination from 'my-sites/stats/pagination';
import ProductsListTable from './products-list-table';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Search from 'components/search';

class Products extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
		products: PropTypes.oneOfType( [
			PropTypes.array,
			PropTypes.bool,
		] ),
		currentPage: PropTypes.number,
		currentPageLoaded: PropTypes.bool,
		requestedPage: PropTypes.number,
		requestedPageLoaded: PropTypes.bool,
		totalProducts: PropTypes.number,
		fetchProducts: PropTypes.func,
	};

	// Total number of results per page (the API returns 10)
	perPage = 10;

	state = {
		isSearching: false,
		query: '',
	}

	componentDidMount() {
		const { site } = this.props;
		if ( site && site.ID ) {
			this.props.fetchProducts( site.ID, 1 );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;
		if ( oldSiteId !== newSiteId ) {
			this.setState( { isSearching: false, query: '' } );
			this.props.fetchProducts( newSiteId, 1 );
		}
	}

	switchPage = ( page ) => {
		const { site } = this.props;
		const { isSearching } = this.state;

		if ( isSearching ) {
			this.props.fetchProductSearchResults( site.ID, page );
		} else {
			this.props.fetchProducts( site.ID, page );
		}
	}

	onSearch = ( query ) => {
		const { site } = this.props;

		if ( trim( query ) === '' ) {
			this.setState( { isSearching: false, query: '' } );
			this.props.clearProductSearch( site.ID );
			return;
		}

		this.setState( { isSearching: true, query } );
		this.props.fetchProductSearchResults( site.ID, 1, query );
	}

	pagination() {
		const { isSearching } = this.state;
		const { site } = this.props;
		const totalProducts = isSearching ? this.props.totalSearchProducts : this.props.totalProducts;
		const currentPage = isSearching ? this.props.currentSearchPage : this.props.currentPage;
		const currentPageLoaded = isSearching ? this.props.currentSearchPageLoaded : this.props.currentPageLoaded;
		const requestedPage = isSearching ? this.props.requestedSearchPage : this.props.requestedPage;

		// If we know previously that all products fit on one page, don't show the placeholder
		// since the Pagination component doesn't display anything for single page display.
		if ( totalProducts && totalProducts < ( this.perPage + 1 ) ) {
			return null;
		}

		if ( ! site || ! currentPageLoaded ) {
			return ( <div className="products__list-placeholder pagination"></div> );
		}

		const page = requestedPage || currentPage;
		return (
			<Pagination
				page={ page }
				perPage={ this.perPage }
				total={ totalProducts }
				pageClick={ this.switchPage }
			/>
		);
	}

	renderEmptyContent() {
		const { translate, site } = this.props;
		const emptyContentAction = (
			<Button href={ getLink( '/store/product/:site/', site ) }>
				{ translate( 'Add your first product' ) }
			</Button>
		);
		return <EmptyContent
				title={ translate( 'You don\'t have any products yet.' ) }
				action={ emptyContentAction }
		/>;
	}

	renderNoSearchResults() {
		const { translate } = this.props;
		return (
			<div>
				<p>
					{ translate( 'No products match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: <em>{ this.state.query }</em>
						}
					} )}
				</p>
			</div>
		);
	}

	renderList() {
		const { site } = this.props;
		const { isSearching } = this.state;

		const products = isSearching ? this.props.searchResults : this.props.products;
		const totalProducts = isSearching ? this.props.totalSearchProducts : this.props.totalProducts;
		const currentPageLoaded = isSearching ? this.props.currentSearchPageLoaded : this.props.currentPageLoaded;
		const requestedPage = isSearching ? this.props.requestedSearchPage : this.props.requestedPage;
		const requestedPageLoaded = isSearching ? this.props.requestedSearchPageLoaded : this.props.requestedPageLoaded;

		if ( currentPageLoaded === true && totalProducts === 0 ) {
			return isSearching ? this.renderNoSearchResults() : this.renderEmptyContent();
		}

		const isRequesting = ( requestedPage && ! requestedPageLoaded ) || ! products ? true : false;
		return (
			<div className="products__list-wrapper">
				<ProductsListTable
					site={ site }
					products={ products }
					isRequesting={ isRequesting }
				/>
				{ this.pagination() }
			</div>
		);
	}

	render() {
		const { className, site, translate } = this.props;
		const classes = classNames( 'products__list', className );
		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<ActionHeader>
					<Button primary href={ getLink( '/store/product/:site/', site ) }>
						{ translate( 'Add a product' ) }
					</Button>
				</ActionHeader>
				<Search
					onSearch={ this.onSearch }
					delaySearch
					delayTimeout={ 400 }
					disabled={ ! site }
					placeholder={ translate( 'Search products…' ) }
				/>
				{ this.renderList() }
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );

	const currentPage = site && getProductListCurrentPage( state, site.ID );
	const currentPageLoaded = site && currentPage && areProductsLoaded( state, currentPage, site.ID );
	const requestedPage = site && getProductListRequestedPage( state, site.ID );
	const requestedPageLoaded = site && requestedPage && areProductsLoaded( state, requestedPage, site.ID );
	const products = site && getProductListProducts( state, site.ID );
	const totalProducts = site && getTotalProducts( state, site.ID );

	const currentSearchPage = site && getProductSearchCurrentPage( state, site.ID );
	const currentSearchPageLoaded = site && currentSearchPage && areProductSearchResultsLoaded( state, currentSearchPage, site.ID );
	const requestedSearchPage = site && getProductSearchRequestedPage( state, site.ID );
	const requestedSearchPageLoaded = site && requestedSearchPage && areProductSearchResultsLoaded( state, requestedSearchPage, site.ID );
	const totalSearchProducts = site && getTotalProductSearchResults( state, site.ID );
	const searchResults = site && getProductSearchResults( state, site.ID );

	return {
		site,
		currentPage,
		currentPageLoaded,
		requestedPage,
		requestedPageLoaded,
		products,
		totalProducts,
		currentSearchPage,
		currentSearchPageLoaded,
		requestedSearchPage,
		requestedSearchPageLoaded,
		totalSearchProducts,
		searchResults,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchProducts,
			fetchProductSearchResults,
			clearProductSearch,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Products ) );
