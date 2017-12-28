/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'client/lib/analytics';
import BasicWidget from 'client/extensions/woocommerce/components/basic-widget';
import { getLink } from 'client/extensions/woocommerce/lib/nav-utils';
import ShareWidget from 'client/extensions/woocommerce/components/share-widget';
import WidgetGroup from 'client/extensions/woocommerce/components/widget-group';

class ManageNoOrdersView extends Component {
	static propTypes = {
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
		const trackClick = () => {
			analytics.tracks.recordEvent( 'calypso_woocommerce_dashboard_action_click', {
				action: 'view-stats',
			} );
			page.redirect( getLink( '/store/stats/orders/day/:site', site ) );
		};
		return (
			<BasicWidget
				buttonLabel={ translate( 'View stats' ) }
				onButtonClick={ trackClick }
				className="dashboard__stats-widget"
				title={ translate( 'Looking for stats?' ) }
			>
				<p>
					{ translate(
						'Store statistics and reports can be found on the site stats screen.' +
							' Keep an eye on revenue, order totals, popular products, and more.'
					) }
				</p>
			</BasicWidget>
		);
	};

	renderViewAndTestWidget = () => {
		const { site, translate } = this.props;
		const trackClick = () => {
			analytics.tracks.recordEvent( 'calypso_woocommerce_dashboard_action_click', {
				action: 'view-and-test',
			} );
		};
		return (
			<BasicWidget
				buttonLabel={ translate( 'View & test your store' ) }
				buttonLink={ site.URL }
				onButtonClick={ trackClick }
				className="dashboard__view-and-test-widget"
				title={ translate( 'Test all the things' ) }
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
			</BasicWidget>
		);
	};

	render = () => {
		return (
			<div className="dashboard__manage-no-orders">
				{ this.renderShareWidget() }
				<WidgetGroup>
					{ this.renderStatsWidget() }
					{ this.renderViewAndTestWidget() }
				</WidgetGroup>
			</div>
		);
	};
}

export default localize( ManageNoOrdersView );
