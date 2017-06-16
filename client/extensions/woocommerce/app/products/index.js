/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import EmptyContent from 'components/empty-content';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getTotalProducts, areProductsLoaded } from 'woocommerce/state/sites/products/selectors';
import { getProductListCurrentPage, getProductListProducts, getProductListRequestedPage } from 'woocommerce/state/ui/products/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import Pagination from 'my-sites/stats/pagination';
import ProductsListTable from './products-list-table';
import SidebarNavigation from 'my-sites/sidebar-navigation';

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
			this.props.fetchProducts( newSiteId, 1 );
		}
	}

	switchPage = ( page ) => {
		const { site } = this.props;
		this.props.fetchProducts( site.ID, page );
	}

	pagination() {
		const { site, currentPage, totalProducts, currentPageLoaded, requestedPage } = this.props;

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
				{ translate( 'Add a product' ) }
			</Button>
		);
		return <EmptyContent
				title={ translate( 'You don\'t have any products.' ) }
				action={ emptyContentAction }
		/>;
	}

	renderList() {
		const { site, products, totalProducts, currentPageLoaded, requestedPageLoaded, requestedPage } = this.props;

		if ( currentPageLoaded === true && totalProducts === 0 ) {
			return this.renderEmptyContent();
		}

		let isRequesting = false;
		if ( requestedPage && ! requestedPageLoaded ) {
			isRequesting = true;
		} else if ( ! products ) {
			isRequesting = true;
		}

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
						{ translate( 'Add product' ) }
					</Button>
				</ActionHeader>
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
	return {
		site,
		currentPage,
		currentPageLoaded,
		requestedPage,
		requestedPageLoaded,
		products,
		totalProducts,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchProducts,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Products ) );
