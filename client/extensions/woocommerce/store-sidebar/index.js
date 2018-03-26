/** @format */

/**
 * External dependencies
 */

import config from 'config';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { fetchReviews } from 'woocommerce/state/sites/reviews/actions';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getNewOrdersWithoutPayPalPending } from 'woocommerce/state/sites/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { getTotalProducts, areProductsLoaded } from 'woocommerce/state/sites/products/selectors';
import { getTotalReviews } from 'woocommerce/state/sites/reviews/selectors';
import { isStoreManagementSupportedInCalypsoForCountry } from 'woocommerce/lib/countries';
import Sidebar from 'layout/sidebar';
import SidebarButton from 'layout/sidebar/button';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarSeparator from 'layout/sidebar/separator';
import StoreGroundControl from './store-ground-control';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class StoreSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		site: PropTypes.object,
	};

	componentDidMount = () => {
		const { productsLoaded, site } = this.props;

		if ( site && site.ID ) {
			this.fetchData( { siteId: site.ID, productsLoaded } );
		}
	};

	componentWillReceiveProps = newProps => {
		const { site } = this.props;

		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( newSiteId && oldSiteId !== newSiteId ) {
			this.fetchData( { ...newProps, siteId: newSiteId } );
		}
	};

	fetchData = ( { siteId, productsLoaded } ) => {
		this.props.fetchSetupChoices( siteId );
		this.props.fetchOrders( siteId );

		this.props.fetchReviews( siteId, { status: 'pending' } );

		if ( ! productsLoaded ) {
			this.props.fetchProducts( siteId, { page: 1 } );
		}
	};

	isItemLinkSelected = paths => {
		if ( ! Array.isArray( paths ) ) {
			paths = [ paths ];
		}

		return paths.some( function( path ) {
			return path === this.props.path || 0 === this.props.path.indexOf( path + '/' );
		}, this );
	};

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
	};

	products = () => {
		const { site, siteSuffix, translate } = this.props;
		const link = '/store/products' + siteSuffix;
		const addLink = '/store/product' + siteSuffix;
		const selected = this.isItemLinkSelected( [
			link,
			addLink,
			'/store/products/categories' + siteSuffix,
		] );
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
				<SidebarButton disabled={ ! site } href={ addLink }>
					{ translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	};

	reviews = () => {
		const { site, siteSuffix, translate, totalPendingReviews } = this.props;
		const link = '/store/reviews' + siteSuffix;
		const selected = this.isItemLinkSelected( [ '/store/reviews' ] );
		const classes = classNames( {
			reviews: true,
			'is-placeholder': ! site,
			selected,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="star-outline"
				label={ translate( 'Reviews' ) }
				link={ link }
			>
				{ totalPendingReviews ? <Count count={ totalPendingReviews } /> : null }
			</SidebarItem>
		);
	};

	orders = () => {
		const { orders, site, siteSuffix, translate } = this.props;
		const link = '/store/orders' + siteSuffix;
		const childLinks = [ '/store/order', '/store/orders' ];
		const selected = this.isItemLinkSelected( childLinks );
		const classes = classNames( {
			orders: true,
			'is-placeholder': ! site,
			selected,
		} );

		return (
			<SidebarItem className={ classes } icon="pages" label={ translate( 'Orders' ) } link={ link }>
				{ orders.length ? <Count count={ orders.length } /> : null }
			</SidebarItem>
		);
	};

	promotions = () => {
		// TODO: Remove this check when ready to release to production.
		if ( ! config.isEnabled( 'woocommerce/extension-promotions' ) ) {
			return null;
		}

		const { site, siteSuffix, translate } = this.props;
		const link = '/store/promotions' + siteSuffix;
		const addLink = '/store/promotion' + siteSuffix;
		const selected = this.isItemLinkSelected( [ link, addLink ] );
		const classes = classNames( {
			promotions: true,
			'is-placeholder': ! site,
			selected,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="gift"
				label={ translate( 'Promotions' ) }
				link={ link }
			>
				<SidebarButton disabled={ ! site } href={ addLink }>
					{ translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	};

	settings = () => {
		const { site, siteSuffix, translate } = this.props;
		const link = '/store/settings' + siteSuffix;
		const childLinks = [
			'/store/settings/payments',
			'/store/settings/shipping',
			'/store/settings/taxes',
			'/store/settings/email',
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
	};

	render = () => {
		const {
			finishedAddressSetup,
			hasProducts,
			path,
			settingsGeneralLoaded,
			site,
			siteId,
			siteSuffix,
			storeLocation,
		} = this.props;

		// Show all items if: we're not on the dashboard, we have finished setup, or we have products.
		const notOnDashboard = 0 !== path.indexOf( '/store' + siteSuffix );
		let showAllSidebarItems = notOnDashboard || finishedAddressSetup || hasProducts;

		// Don't show all the sidebar items if we don't know what country the store is in
		if ( showAllSidebarItems ) {
			if ( ! settingsGeneralLoaded ) {
				showAllSidebarItems = false;
			} else {
				const storeCountry = get( storeLocation, 'country' );
				showAllSidebarItems = isStoreManagementSupportedInCalypsoForCountry( storeCountry );
			}
		}

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
				<QuerySettingsGeneral siteId={ siteId } />
			</Sidebar>
		);
	};
}

function mapStateToProps( state ) {
	const finishedAddressSetup = getSetStoreAddressDuringInitialSetup( state );
	const hasProducts = getTotalProducts( state ) > 0;
	const orders = getNewOrdersWithoutPayPalPending( state );
	const productsLoaded = areProductsLoaded( state );
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;
	const totalPendingReviews = getTotalReviews( state, { status: 'pending' } );
	const settingsGeneralLoaded = areSettingsGeneralLoaded( state, siteId );
	const storeLocation = getStoreLocation( state, siteId );

	return {
		finishedAddressSetup,
		hasProducts,
		orders,
		totalPendingReviews,
		productsLoaded,
		settingsGeneralLoaded,
		site,
		siteId,
		siteSuffix: site ? '/' + site.slug : '',
		storeLocation,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchOrders,
			fetchProducts,
			fetchReviews,
			fetchSetupChoices,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( StoreSidebar ) );
