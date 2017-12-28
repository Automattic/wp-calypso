/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import config from 'config';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'client/extensions/woocommerce/components/action-header';
import Button from 'client/components/button';
import { fetchProducts } from 'client/extensions/woocommerce/state/sites/products/actions';
import { getLink } from 'client/extensions/woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'client/extensions/woocommerce/state/sites/selectors';
import {
	getTotalProducts,
	areProductsLoaded,
	areProductsLoading,
} from 'client/extensions/woocommerce/state/sites/products/selectors';
import Main from 'client/components/main';
import NavTabs from 'client/components/section-nav/tabs';
import NavItem from 'client/components/section-nav/item';
import ProductsList from './products-list';
import ProductsListSearchResults from './products-list-search-results';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import SearchCard from 'client/components/search-card';
import SectionNav from 'client/components/section-nav';
import Search from 'client/components/search';

class Products extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
		fetchProducts: PropTypes.func.isRequired,
	};

	state = {
		query: '',
	};

	componentDidMount() {
		const { site } = this.props;
		if ( site && site.ID ) {
			this.props.fetchProducts( site.ID, { page: 1 } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.setState( { query: '' } );
			this.props.fetchProducts( newSiteId, { page: 1 } );
		}
	}

	switchPage = page => {
		const { site } = this.props;
		if ( trim( this.state.query ) !== '' ) {
			this.props.fetchProducts( site.ID, { page, search: this.state.query } );
		} else {
			this.props.fetchProducts( site.ID, { page } );
		}
	};

	onSearch = query => {
		const { site } = this.props;

		if ( trim( query ) === '' ) {
			this.setState( { query: '' } );
			return;
		}

		this.setState( { query } );
		this.props.fetchProducts( site.ID, { search: query } );
	};

	// TODO When this launches, we can reduce this to just the `SectionNav` code.
	renderSearchCardOrSectionNav() {
		const { site, translate, productsLoading, productsLoaded, totalProducts } = this.props;

		if ( config.isEnabled( 'woocommerce/extension-product-categories' ) ) {
			const productsLabel = translate( 'Products' );

			return (
				<SectionNav>
					<NavTabs label={ productsLabel } selectedText={ productsLabel }>
						<NavItem path={ getLink( '/store/products/:site/', site ) } selected>
							{ productsLabel }
						</NavItem>
						<NavItem path={ getLink( '/store/products/categories/:site/', site ) }>
							{ translate( 'Categories' ) }
						</NavItem>
					</NavTabs>

					<Search
						pinned
						fitsContainer
						onSearch={ this.onSearch }
						placeholder={ translate( 'Search products…' ) }
						delaySearch
						delayTimeout={ 400 }
					/>
				</SectionNav>
			);
		}

		let output = null;
		// Show the search card if we actually have products, or during the loading process as part of the placeholder UI
		if (
			( productsLoaded === true && totalProducts > 0 ) ||
			( ! site || productsLoading === true )
		) {
			output = (
				<SearchCard
					onSearch={ this.onSearch }
					delaySearch
					delayTimeout={ 400 }
					disabled={ ! site }
					placeholder={ translate( 'Search products…' ) }
				/>
			);
		}

		return output;
	}

	render() {
		const { className, site, translate } = this.props;
		const classes = classNames( 'products__list', className );

		let productsDisplay;
		if ( trim( this.state.query ) === '' ) {
			productsDisplay = <ProductsList onSwitchPage={ this.switchPage } />;
		} else {
			productsDisplay = <ProductsListSearchResults onSwitchPage={ this.switchPage } />;
		}

		return (
			<Main className={ classes } wideLayout>
				<SidebarNavigation />
				<ActionHeader breadcrumbs={ <span>{ translate( 'Products' ) }</span> }>
					<Button primary href={ getLink( '/store/product/:site/', site ) }>
						{ translate( 'Add a product' ) }
					</Button>
				</ActionHeader>
				{ this.renderSearchCardOrSectionNav() }
				{ productsDisplay }
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const defaultParams = {};
	const productsLoaded = site && areProductsLoaded( state, defaultParams, site.ID );
	const totalProducts = site && getTotalProducts( state, defaultParams, site.ID );
	const productsLoading = site && areProductsLoading( state, defaultParams, site.ID );
	return {
		site,
		productsLoaded,
		productsLoading,
		totalProducts,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators( { fetchProducts }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Products ) );
