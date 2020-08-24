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
import { areAllRequiredPluginsActive } from 'woocommerce/state/selectors/plugins';
import {
	areCountsLoaded,
	getCountProducts,
	getCountNewOrders,
	getCountPendingReviews,
} from 'woocommerce/state/sites/data/counts/selectors';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import Count from 'components/count';
import { fetchCounts } from 'woocommerce/state/sites/data/counts/actions';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { isLoaded as arePluginsLoaded } from 'state/plugins/installed/selectors';
import { isStoreManagementSupportedInCalypsoForCountry } from 'woocommerce/lib/countries';
import Sidebar from 'layout/sidebar';
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

	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.fetchData();
		}
	}

	componentDidUpdate( prevProps ) {
		const { allRequiredPluginsActive, pluginsLoaded, siteId } = this.props;
		const oldSiteId = prevProps.siteId ? prevProps.siteId : null;

		// If the site has changed, or plugin status has changed, re-fetch data
		if (
			siteId !== oldSiteId ||
			prevProps.allRequiredPluginsActive !== allRequiredPluginsActive ||
			prevProps.pluginsLoaded !== pluginsLoaded
		) {
			this.fetchData();
		}
	}

	fetchData = () => {
		const { isLoaded, siteId } = this.props;
		if ( ! isLoaded ) {
			this.props.fetchCounts( siteId );
		}

		this.props.fetchSetupChoices( siteId );
	};

	isItemLinkSelected = ( paths ) => {
		if ( ! Array.isArray( paths ) ) {
			paths = [ paths ];
		}

		return paths.some( function ( path ) {
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
		const selected = this.isItemLinkSelected( [ link, '/store/products/categories' + siteSuffix ] );
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
			/>
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
		const { totalNewOrders, site, siteSuffix, translate } = this.props;
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
				{ totalNewOrders ? <Count count={ totalNewOrders } /> : null }
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
		const selected = this.isItemLinkSelected( [ link ] );
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
			/>
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
			allRequiredPluginsActive,
			finishedAddressSetup,
			hasProducts,
			path,
			pluginsLoaded,
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

		const shouldLoadSettings = pluginsLoaded && allRequiredPluginsActive;

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
				{ shouldLoadSettings && <QuerySettingsGeneral siteId={ siteId } /> }
			</Sidebar>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;
	const finishedAddressSetup = getSetStoreAddressDuringInitialSetup( state );
	const hasProducts = getCountProducts( state ) > 0;
	const isLoaded = areCountsLoaded( state );
	const totalNewOrders = getCountNewOrders( state );
	const totalPendingReviews = getCountPendingReviews( state );
	const settingsGeneralLoaded = areSettingsGeneralLoaded( state, siteId );
	const storeLocation = getStoreLocation( state, siteId );
	const pluginsLoaded = arePluginsLoaded( state, siteId );
	const allRequiredPluginsActive = areAllRequiredPluginsActive( state, siteId );

	return {
		allRequiredPluginsActive,
		finishedAddressSetup,
		hasProducts,
		isLoaded,
		totalNewOrders,
		totalPendingReviews,
		pluginsLoaded,
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
			fetchCounts,
			fetchSetupChoices,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( StoreSidebar ) );
