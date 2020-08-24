/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import config from 'config';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import DashboardWidgetRow from 'woocommerce/components/dashboard-widget/row';
import { getCountProducts } from 'woocommerce/state/sites/data/counts/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getProductsSettingValue } from 'woocommerce/state/sites/settings/products/selectors';
import InventoryWidget from './widgets/inventory-widget';
import QuerySettingsProducts from 'woocommerce/components/query-settings-products';
import { recordTrack } from 'woocommerce/lib/analytics';
import ShareWidget from 'woocommerce/components/share-widget';
import StatsWidget from './widgets/stats-widget';

class ManageNoOrdersView extends Component {
	static propTypes = {
		hasProducts: PropTypes.bool.isRequired,
		shopPageId: PropTypes.string,
		site: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
			URL: PropTypes.string.isRequired,
		} ),
	};

	renderShareWidget = () => {
		const { site, translate } = this.props;
		return (
			<ShareWidget
				text={ translate(
					'Your store is ready to take orders - congratulations! ' +
						'Spread the word to get orders rolling in.'
				) }
				title={ translate( 'Your store is ready, the world awaits!' ) }
				urlToShare={ site.URL }
			/>
		);
	};

	renderStatsWidget = () => {
		const { site, translate } = this.props;

		if ( config.isEnabled( 'woocommerce/extension-dashboard-stats-widget' ) ) {
			return null;
		}

		const trackClick = () => {
			recordTrack( 'calypso_woocommerce_dashboard_action_click', {
				action: 'view-stats',
			} );
			page.redirect( getLink( '/store/stats/orders/week/:site', site ) );
		};
		return (
			<DashboardWidget
				className="dashboard__stats-widget"
				image="/calypso/images/extensions/woocommerce/woocommerce-sample-graph.svg"
				imagePosition="bottom"
				imageFlush
				title={ translate( 'Looking for stats?' ) }
				width="half"
			>
				<p>
					{ translate(
						'Store statistics and reports can be found on the site stats screen.' +
							' Keep an eye on revenue, order totals, popular products, and more.'
					) }
				</p>
				<Button onClick={ trackClick }>{ translate( 'View stats' ) }</Button>
			</DashboardWidget>
		);
	};

	renderInventoryWidget = () => {
		return <InventoryWidget width="half" />;
	};

	renderViewAndTestWidget = () => {
		const { site, translate, shopPageId } = this.props;
		const trackClick = () => {
			recordTrack( 'calypso_woocommerce_dashboard_action_click', {
				action: 'view-and-test',
			} );
		};

		const shopUrl = shopPageId && site.URL + '?p=' + shopPageId;

		return (
			<DashboardWidget
				className="dashboard__view-and-test-widget"
				title={ translate( 'Test all the things' ) }
				width="half"
			>
				<p>
					{ translate(
						'Your store is live! It’s a good idea to double check' +
							' your tax, shipping, and payment configurations are set up correctly.'
					) }
				</p>
				<p>
					{ translate(
						'The easiest way to do this is to view your store, add' +
							' a product to your cart, and attempt to check out using different addresses.'
					) }
				</p>
				<Button onClick={ trackClick } href={ shopUrl } disabled={ ! shopUrl }>
					{ translate( 'View & test your store' ) }
				</Button>
			</DashboardWidget>
		);
	};

	render() {
		const { hasProducts, site } = this.props;
		return (
			<div className="dashboard__manage-no-orders">
				<QuerySettingsProducts siteId={ site && site.ID } />
				{ this.renderShareWidget() }
				<DashboardWidgetRow>
					{ hasProducts ? this.renderInventoryWidget() : this.renderStatsWidget() }
					{ this.renderViewAndTestWidget() }
				</DashboardWidgetRow>
				{ config.isEnabled( 'woocommerce/extension-dashboard-stats-widget' ) && <StatsWidget /> }
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	hasProducts: getCountProducts( state ) > 0,
	shopPageId: getProductsSettingValue( state, 'woocommerce_shop_page_id' ),
} ) )( localize( ManageNoOrdersView ) );
