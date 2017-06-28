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
import { fetchProducts, fetchProductSearchResults, clearProductSearch } from 'woocommerce/state/sites/products/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
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
		fetchProductSearchResults: PropTypes.func.isRequired,
		clearProductSearch: PropTypes.func.isRequired,
	};

	state = {
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
			this.setState( { query: '' } );
			this.props.fetchProducts( newSiteId, 1 );
		}
	}

	switchPage = ( page ) => {
		const { site } = this.props;
		if ( trim( this.state.query ) !== '' ) {
			this.props.fetchProductSearchResults( site.ID, page );
		} else {
			this.props.fetchProducts( site.ID, page );
		}
	}

	onSearch = ( query ) => {
		const { site } = this.props;

		if ( trim( query ) === '' ) {
			this.setState( { query: '' } );
			this.props.clearProductSearch( site.ID );
			return;
		}

		this.setState( { query } );
		this.props.fetchProductSearchResults( site.ID, 1, query );
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
			<Main className={ classes }>
				<SidebarNavigation />
				<ActionHeader breadcrumbs={ ( <span>{ translate( 'Products' ) }</span> ) }>
					<Button primary href={ getLink( '/store/product/:site/', site ) }>
						{ translate( 'Add a product' ) }
					</Button>
				</ActionHeader>
				<SearchCard
					onSearch={ this.onSearch }
					delaySearch
					delayTimeout={ 400 }
					disabled={ ! site }
					placeholder={ translate( 'Search products…' ) }
				/>
				{ productsDisplay }
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
			fetchProducts,
			fetchProductSearchResults,
			clearProductSearch,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Products ) );
