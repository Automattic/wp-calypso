import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Sidebar from 'calypso/layout/sidebar';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import { getSelectedSiteWithFallback } from 'calypso/state/sites/selectors';
import StoreGroundControl from './store-ground-control';

class StoreSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		site: PropTypes.object,
	};

	dashboard = () => {
		const { site, siteSuffix, translate } = this.props;
		const link = '/store' + siteSuffix;
		const classes = clsx( {
			dashboard: true,
			'is-placeholder': ! site,
			selected: true,
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
		const { site, translate } = this.props;

		const link = site.URL + '/wp-admin/edit.php?post_type=product';

		const classes = clsx( {
			products: true,
			'is-placeholder': ! site,
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
		const { site, translate } = this.props;
		const link = site.URL + '/wp-admin/edit-comments.php';

		const classes = clsx( {
			reviews: true,
			'is-placeholder': ! site,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="star-outline"
				label={ translate( 'Reviews' ) }
				link={ link }
			/>
		);
	};

	orders = () => {
		const { site, translate } = this.props;

		const link = site.URL + '/wp-admin/edit.php?post_type=shop_order';

		const classes = clsx( {
			orders: true,
			'is-placeholder': ! site,
		} );

		return (
			<SidebarItem
				className={ classes }
				icon="pages"
				label={ translate( 'Orders' ) }
				link={ link }
			/>
		);
	};

	promotions = () => {
		const { site, translate } = this.props;

		const link = site.URL + '/wp-admin/edit.php?post_type=shop_coupon';

		const classes = clsx( {
			promotions: true,
			'is-placeholder': ! site,
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
		const { site, translate } = this.props;

		const link = site.URL + '/wp-admin/admin.php?page=wc-settings';

		const classes = clsx( {
			settings: true,
			'is-placeholder': ! site,
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
		const { site } = this.props;

		return (
			<Sidebar className="store-sidebar__sidebar">
				<StoreGroundControl site={ site } />
				<SidebarMenu>
					{ this.dashboard() }
					{ this.products() }
					{ this.orders() }
					{ this.promotions() }
					{ this.reviews() }
					<SidebarSeparator />
					{ this.settings() }
				</SidebarMenu>
			</Sidebar>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;

	return {
		site,
		siteId,
		siteSuffix: site ? '/' + site.slug : '',
	};
}

export default connect( mapStateToProps, null )( localize( StoreSidebar ) );
