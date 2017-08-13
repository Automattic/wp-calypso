/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getNewOrders } from 'woocommerce/state/sites/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { getTotalProducts, areProductsLoaded } from 'woocommerce/state/sites/products/selectors';
import Sidebar from 'layout/sidebar';
import SidebarButton from 'layout/sidebar/button';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarSeparator from 'layout/sidebar/separator';
import StoreGroundControl from './store-ground-control';

class StoreSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		site: PropTypes.object,
	}

	componentDidMount = () => {
		const { productsLoaded, site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSetupChoices( site.ID );
			this.props.fetchOrders( site.ID );

			if ( ! productsLoaded ) {
				this.props.fetchProducts( site.ID, 1 );
			}
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { productsLoaded, site } = this.props;

		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( newSiteId && ( oldSiteId !== newSiteId ) ) {
			this.props.fetchSetupChoices( newSiteId );
			this.props.fetchOrders( newSiteId );

			if ( ! productsLoaded ) {
				this.props.fetchProducts( newSiteId, 1 );
			}
		}
	}

	isItemLinkSelected = ( paths ) => {
		if ( ! Array.isArray( paths ) ) {
			paths = [ paths ];
		}

		return paths.some( function( path ) {
			return path === this.props.path || 0 === this.props.path.indexOf( path + '/' );
		}, this );
	}

	dashboard = () => {
		const { site, siteSuffix, translate } = this.props;
		const link = '/store' + siteSuffix;
		const selected = this.isItemLinkSelected( link );
		const classes = classNames( {
			dashboard: true,
			'is-placeholder': ! site,
			selected,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="house"
				label={ translate( 'Dashboard' ) }
				link={ link }
			/>
		);
	}

	products = () => {
		const { site, siteSuffix, translate } = this.props;
		const link = '/store/products' + siteSuffix;
		const addLink = '/store/product' + siteSuffix;
		const selected = this.isItemLinkSelected( [ link, addLink ] );
		const classes = classNames( {
			products: true,
			'is-placeholder': ! site,
			selected,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="product"
				label={ translate( 'Products' ) }
				link={ link }
			>
				<SidebarButton disabled={ ! site } href={ addLink } >
					{ translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	}

	orders = () => {
		const { orders, site, siteSuffix, translate } = this.props;
		const link = '/store/orders' + siteSuffix;
		const childLinks = [
			'/store/order',
			'/store/orders',
		];
		const selected = this.isItemLinkSelected( childLinks );
		const classes = classNames( {
			orders: true,
			'is-placeholder': ! site,
			selected,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="pages"
				label={ translate( 'Orders' ) }
				link={ link }
			>
				{ orders.length
					? <Count count={ orders.length } />
					: null
				}
			</SidebarItem>
		);
	}

	settings = () => {
		const { site, siteSuffix, translate } = this.props;
		const link = '/store/settings' + siteSuffix;
		const childLinks = [
			'/store/settings/payments',
			'/store/settings/shipping',
			'/store/settings/taxes',
			'/store/settings/development'
		];
		const selected = this.isItemLinkSelected( [ link, ...childLinks ] );
		const classes = classNames( {
			settings: true,
			'is-placeholder': ! site,
			selected,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="cog"
				label={ translate( 'Settings' ) }
				link={ link }
			/>
		);
	}

	render = () => {
		const { finishedAddressSetup, hasProducts, site } = this.props;

		const showAllSidebarItems = finishedAddressSetup || hasProducts;

		return (
			<Sidebar className="store-sidebar__sidebar">
				<StoreGroundControl site={ site } />
				<SidebarMenu>
					<ul>
						{ this.dashboard() }
						{ showAllSidebarItems && this.products() }
						{ showAllSidebarItems && this.orders() }
						{ showAllSidebarItems && <SidebarSeparator /> }
						{ showAllSidebarItems && this.settings() }
					</ul>
				</SidebarMenu>
			</Sidebar>
		);
	}
}

function mapStateToProps( state ) {
	const finishedAddressSetup = getSetStoreAddressDuringInitialSetup( state );
	const hasProducts = getTotalProducts( state ) > 0;
	const orders = getNewOrders( state );
	const productsLoaded = areProductsLoaded( state );
	const site = getSelectedSiteWithFallback( state );

	return {
		finishedAddressSetup,
		hasProducts,
		orders,
		productsLoaded,
		site,
		siteSuffix: site ? '/' + site.slug : '',
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchOrders,
			fetchProducts,
			fetchSetupChoices,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( StoreSidebar ) );
