/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import StoreGroundControl from './store-ground-control';
import Count from 'components/count';
import config from 'config';
import Sidebar from 'layout/sidebar';
import SidebarButton from 'layout/sidebar/button';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarSeparator from 'layout/sidebar/separator';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { getNewOrders } from 'woocommerce/state/sites/orders/selectors';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { getTotalProducts, areProductsLoaded } from 'woocommerce/state/sites/products/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';

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

	reviews = () => {
		if ( ! config.isEnabled( 'woocommerce/extension-reviews' ) ) {
			return null;
		}

		const { site, siteSuffix, translate } = this.props;
		const link = '/store/reviews' + siteSuffix;
		const selected = this.isItemLinkSelected( [ link ] );
		const classes = classNames( {
			reviews: true,
			'is-placeholder': ! site,
			selected,
		} );

		// TODO Add bubble containing count of unapproved reviews.
		return (
			<SidebarItem
				className={ classes }
				icon="star-outline"
				label={ translate( 'Reviews' ) }
				link={ link }
			>
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

	promotions = () => {
		// TODO: Remove this check when ready to release to production.
		if ( ! config.isEnabled( 'woocommerce/extension-promotions' ) ) {
			return null;
		}

		const { site, siteSuffix, translate } = this.props;
		const link = '/store/promotions' + siteSuffix;
		const validLinks = [
			'/store/promotions',
			'/store/promotion',
		];

		const selected = this.isItemLinkSelected( validLinks );
		const classes = classNames( {
			promotions: true,
			'is-placeholder': ! site,
			selected,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="star-outline"
				label={ translate( 'Promotions' ) }
				link={ link }
			>
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
		const {
			finishedAddressSetup,
			hasProducts,
			path,
			site,
			siteSuffix,
		} = this.props;

		// Show all items if: we're not on the dashboard, we have finished setup, or we have products.
		const notOnDashboard = 0 !== path.indexOf( '/store' + siteSuffix );
		const showAllSidebarItems = notOnDashboard || finishedAddressSetup || hasProducts;

		return (
			<Sidebar className="store-sidebar__sidebar">
				<StoreGroundControl site={ site } />
				<SidebarMenu>
					<ul>
						{ this.dashboard() }
						{ showAllSidebarItems && this.products() }
						{ showAllSidebarItems && this.orders() }
						{ showAllSidebarItems && this.promotions() }
						{ showAllSidebarItems && this.reviews() }
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
