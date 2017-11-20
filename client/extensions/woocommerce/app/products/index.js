/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	getTotalProducts,
	areProductsLoaded,
	areProductsLoading,
} from 'woocommerce/state/sites/products/selectors';
import Main from 'components/main';
import ProductsList from './products-list';
import ProductsListSearchResults from './products-list-search-results';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SearchCard from 'components/search-card';

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

	render() {
		const {
			className,
			site,
			translate,
			productsLoading,
			productsLoaded,
			totalProducts,
		} = this.props;
		const classes = classNames( 'products__list', className );

		let productsDisplay;
		if ( trim( this.state.query ) === '' ) {
			productsDisplay = <ProductsList onSwitchPage={ this.switchPage } />;
		} else {
			productsDisplay = <ProductsListSearchResults onSwitchPage={ this.switchPage } />;
		}

		let searchCard = null;
		// Show the search card if we actually have products, or during the loading process as part of the placeholder UI
		if (
			( productsLoaded === true && totalProducts > 0 ) ||
			( ! site || productsLoading === true )
		) {
			searchCard = (
				<SearchCard
					onSearch={ this.onSearch }
					delaySearch
					delayTimeout={ 400 }
					disabled={ ! site }
					placeholder={ translate( 'Search products…' ) }
				/>
			);
		}

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<ActionHeader breadcrumbs={ <span>{ translate( 'Products' ) }</span> }>
					<Button primary href={ getLink( '/store/product/:site/', site ) }>
						{ translate( 'Add a product' ) }
					</Button>
				</ActionHeader>
				{ searchCard }
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
