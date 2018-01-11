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
import Button from 'components/button';
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
		const { siteId } = this.props;
		if ( siteId ) {
			this.props.fetchProductCategories( siteId, { page: 1 } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { siteId } = this.props;
		const newSiteId = ( newProps.siteId ) || null;
		if ( siteId !== newSiteId ) {
			this.props.fetchProductCategories( newSiteId, { page: 1 } );
		}
	}

	requestPages = pages => {
		const { site } = this.props;
		const { searchQuery } = this.state;

		const requestedPages = searchQuery && searchQuery.length && this.state.requestedSearchPages || this.state.requestedPages;
		const stateName = searchQuery && searchQuery.length && 'requestedSearchPages' || 'requestedPages';

		pages.forEach( page => {
			if ( ! includes( requestedPages, page ) ) {
				this.props.fetchProductCategories( site.ID, { search: searchQuery, page } );
			}
		} );

		this.setState( {
			[ stateName ]: union( requestedPages, pages ),
		} );
	};

	onSearch = query => {
		const { site } = this.props;

		if ( trim( query ) === '' ) {
			this.setState( { searchQuery: '', requestedSearchPages: [] } );
			return;
		}

		this.setState( { searchQuery: query, requestedSearchPages: [ 1 ] } );
		this.props.fetchProductCategories( site.ID, { search: query } );

		recordTrack( 'calypso_woocommerce_product_category_search', {
			query,
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
	const siteId = site ? site.ID : null;
	return {
		site,
		siteId,
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
