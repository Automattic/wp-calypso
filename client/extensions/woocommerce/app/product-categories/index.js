/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { union, includes, trim, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { Button } from '@automattic/components';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import ProductCategoriesList from 'woocommerce/app/product-categories/list';
import { recordTrack } from 'woocommerce/lib/analytics';
import SectionNav from 'components/section-nav';
import Search from 'components/search';
import { withAnalytics } from 'state/analytics/actions';

class ProductCategories extends Component {
	state = {
		requestedPages: [ 1 ],
		requestedSearchPages: [],
	};

	constructor( props ) {
		super( props );
		this.debouncedOnSearch = debounce( this.onSearch, 500 );
	}

	UNSAFE_componentWillMount() {
		const { siteId } = this.props;
		if ( siteId ) {
			this.props.fetchProductCategories( siteId, { page: 1 } );
		}
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		const { siteId } = this.props;
		const newSiteId = newProps.siteId || null;
		if ( siteId !== newSiteId ) {
			this.props.fetchProductCategories( newSiteId, { page: 1 } );
		}
	}

	requestPages = ( pages ) => {
		const { site } = this.props;
		const { searchQuery } = this.state;

		let stateName = 'requestedPages';
		if ( searchQuery && searchQuery.length ) {
			// We're viewing search results, and should use the search value
			stateName = 'requestedSearchPages';
		}
		const requestedPages = this.state[ stateName ];

		pages.forEach( ( page ) => {
			if ( ! includes( requestedPages, page ) ) {
				this.props.fetchProductCategories( site.ID, { search: searchQuery, page } );
			}
		} );

		this.setState( {
			[ stateName ]: union( requestedPages, pages ),
		} );
	};

	onSearch = ( query ) => {
		const { site } = this.props;

		if ( trim( query ) === '' ) {
			this.setState( { searchQuery: '', requestedSearchPages: [] } );
			return;
		}

		this.setState( { searchQuery: query, requestedSearchPages: [ 1 ] } );
		this.props.searchProductCategories( site.ID, { search: query } );
	};

	render() {
		const { site, className, translate } = this.props;
		const { searchQuery } = this.state;
		const classes = classNames( 'product_categories__list-wrapper', className );

		const productsLabel = translate( 'Products' );
		const categoriesLabel = translate( 'Categories' );

		return (
			<Main className={ classes } wideLayout>
				<ActionHeader
					breadcrumbs={ [
						<a href={ getLink( '/store/products/:site/', site ) }>{ productsLabel }</a>,
						<span>{ categoriesLabel }</span>,
					] }
				>
					<Button primary href={ getLink( '/store/products/category/:site/', site ) }>
						{ translate( 'Add category' ) }
					</Button>
				</ActionHeader>
				<SectionNav selectedText={ categoriesLabel }>
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
				<ProductCategoriesList searchQuery={ searchQuery } requestPages={ this.requestPages } />
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;
	return {
		site,
		siteId,
	};
}

const mapDispatchToProps = ( dispatch ) => ( {
	searchProductCategories: ( siteId, query ) =>
		withAnalytics(
			recordTrack( 'calypso_woocommerce_product_category_search', query ),
			fetchProductCategories( siteId, query )( dispatch )
		),
	fetchProductCategories: ( ...args ) => fetchProductCategories( ...args )( dispatch ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCategories ) );
