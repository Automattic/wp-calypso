/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getNewOrders } from 'woocommerce/state/sites/orders/selectors';
import { getSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
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
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSetupChoices( site.ID );
			this.props.fetchOrders( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;

		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchSetupChoices( newSiteId );
			this.props.fetchOrders( newSiteId );
		}
	}

	onNavigate = () => {
		window.scrollTo( 0, 0 );
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
				onNavigate={ this.onNavigate }
				preloadSectionName={ 'dashboard' } />
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
				onNavigate={ this.onNavigate }
				preloadSectionName={ 'products' } >
				<SidebarButton disabled={ ! site } href={ addLink } >
					{ translate( 'Add' ) }
				</SidebarButton>
			</SidebarItem>
		);
	}

	orders = () => {
		const { orders, site, siteSuffix, translate } = this.props;
		const link = '/store/orders' + siteSuffix;
		// We don't use the addLink yet, but this ensures the item is selected on single views
		const addLink = '/store/order' + siteSuffix;
		const selected = this.isItemLinkSelected( [ link, addLink ] );
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
				onNavigate={ this.onNavigate }
				preloadSectionName={ 'orders' }>
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
			'/store/settings/payments' + siteSuffix,
			'/store/settings/shipping' + siteSuffix,
			'/store/settings/taxes' + siteSuffix,
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
				onNavigate={ this.onNavigate }
				preloadSectionName={ 'settings' } />
		);
	}

	render = () => {
		const { finishedAddressSetup, site } = this.props;

		return (
			<Sidebar className="store-sidebar__sidebar">
				<StoreGroundControl site={ site } />
				<SidebarMenu>
					<ul>
						{ this.dashboard() }
						{ finishedAddressSetup && this.products() }
						{ finishedAddressSetup && this.orders() }
						{ finishedAddressSetup && <SidebarSeparator /> }
						{ finishedAddressSetup && this.settings() }
					</ul>
				</SidebarMenu>
			</Sidebar>
		);
	}
}

function mapStateToProps( state ) {
	const finishedAddressSetup = getSetStoreAddressDuringInitialSetup( state );
	const site = getSelectedSiteWithFallback( state );
	const orders = getNewOrders( state );

	return {
		finishedAddressSetup,
		orders,
		site,
		siteSuffix: site ? '/' + site.slug : '',
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchOrders,
			fetchSetupChoices,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( StoreSidebar ) );
