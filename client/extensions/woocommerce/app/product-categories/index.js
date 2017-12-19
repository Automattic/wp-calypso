/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { union, includes, trim, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { DEFAULT_PRODUCT_CATEGORIES_PER_PAGE } from 'woocommerce/state/sites/product-categories/utils';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import ProductCategoriesList from 'woocommerce/app/product-categories/list';
import SectionNav from 'components/section-nav';
import Search from 'components/search';

class ProductCategories extends Component {

	state = {
		requestedPages: [ 1 ],
		requestedSearchPages: [],
	};

	constructor( props ) {
		super( props );
		this.debouncedOnSearch = debounce( this.onSearch, 500 );
	}

	componentWillMount() {
		const { site } = this.props;
		this.props.fetchProductCategories( site.ID, {
			page: 1,
			per_page: DEFAULT_PRODUCT_CATEGORIES_PER_PAGE,
		} );
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProductCategories( newSiteId, {
				page: 1,
				per_page: DEFAULT_PRODUCT_CATEGORIES_PER_PAGE,
			} );
		}
	}

	requestPages = pages => {
		const { site } = this.props;
		const { searchQuery } = this.state;

		if ( searchQuery && searchQuery.length ) {
			pages.forEach( page => {
				if ( ! includes( this.state.requestedSearchPages, page ) ) {
					this.props.fetchProductCategories( site.ID, {
						per_page: DEFAULT_PRODUCT_CATEGORIES_PER_PAGE,
						search: searchQuery,
						page,
					} );
				}
			} );

			this.setState( {
				requestedSearchPages: union( this.state.requestedSearchPages, pages ),
			} );
		} else {
			pages.forEach( page => {
				if ( ! includes( this.state.requestedPages, page ) ) {
					this.props.fetchProductCategories( site.ID, {
						per_page: DEFAULT_PRODUCT_CATEGORIES_PER_PAGE,
						page,
					} );
				}
			} );

			this.setState( {
				requestedPages: union( this.state.requestedPages, pages ),
			} );
		}
	};

	onSearch = query => {
		const { site } = this.props;

		if ( trim( query ) === '' ) {
			this.setState( { searchQuery: '', requestedSearchPages: [] } );
			return;
		}

		this.setState( { searchQuery: query, requestedSearchPages: [ 1 ] } );
		this.props.fetchProductCategories( site.ID, {
			search: query,
			per_page: DEFAULT_PRODUCT_CATEGORIES_PER_PAGE,
		} );
	};

	render() {
		const { site, className, translate } = this.props;
		const { searchQuery } = this.state;
		const classes = classNames( 'product_categories__list-wrapper', className );

		const productsLabel = translate( 'Products' );
		const categoriesLabel = translate( 'Categories' );

		return (
			<Main className={ classes } wideLayout>
				<ActionHeader breadcrumbs={ [
					<a href={ getLink( '/store/products/:site/', site ) }>{ productsLabel }</a>,
					<span>{ categoriesLabel }</span>,
				] }>
				</ActionHeader>
				<SectionNav>
					<NavTabs label={ translate( 'Products' ) } selectedText={ categoriesLabel }>
						<NavItem path={ getLink( '/store/products/:site/', site ) }>{ productsLabel }</NavItem>
						<NavItem path={ getLink( '/store/products/categories/:site/', site ) } selected>
							{ categoriesLabel }
						</NavItem>
					</NavTabs>

					<Search
						pinned
						fitsContainer
						onSearch={ this.debouncedOnSearch }
						placeholder={ translate( 'Search categories…' ) }
					/>
				</SectionNav>
				<ProductCategoriesList
					searchQuery={ searchQuery }
					requestPages={ this.requestPages }
				/>
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchProductCategories,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCategories ) );
