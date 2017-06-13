/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import BasicWidget from 'woocommerce/components/basic-widget';
import { getLink } from 'woocommerce/lib/nav-utils';
import ReadingWidget from 'woocommerce/components/reading-widget';
import ShareWidget from 'woocommerce/components/share-widget';
import WidgetGroup from 'woocommerce/components/widget-group';

class ManageNoOrders extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
		} ),
	};

	renderShareWidget = () => {
		const { site, translate } = this.props;
		return (
			<ShareWidget
				text={ translate( 'Congratulations! Now that your setup is complete you can spread the word' +
					' and get those first orders rolling in. Share your store with friends,' +
					' family, and followers now.' ) }
				title={ translate( 'Your store is ready, the world awaits!' ) }
				urlToShare={ getLink( 'https://:site', site ) }
			/>
		);
	}

	renderReadingWidget = () => {
		const { site, translate } = this.props;
		return (
			<ReadingWidget
				className="dashboard__reading-widget"
				site={ site }
				text={ translate( 'You’re not alone! Get tips from seasoned merchants,' +
					' learn best practices to keep your store ship-shape,' +
					' and find how to boost your sales and drive traffic.' ) }
				title={ translate( 'Recommended reading' ) }
			/>
		);
	}

	renderExampleOrderWidget = () => {
		const { site, translate } = this.props;
		return (
			<BasicWidget
				buttonLabel={ translate( 'View an example order' ) }
				buttonLink={ getLink( '/store/orders/:site/example', site ) }
				className="dashboard__example-order-widget"
				title={ translate( 'Looking for orders and reports?' ) }
			>
				<p>
					{ translate( 'This dashboard will evolve as your store grows.' +
						' Statistics will form and order overviews will display when your' +
						' first orders start arriving.' ) }
				</p>
			</BasicWidget>
		);
	}

	renderViewAndTestWidget = () => {
		const { site, translate } = this.props;
		return (
			<BasicWidget
				buttonLabel={ translate( 'View & test your store' ) }
				buttonLink={ getLink( 'https://:site', site ) }
				className="dashboard__view-and-test-widget"
				title={ translate( 'Test all the things' ) }
			>
				<p>
					{
						translate( 'Your store is live! It’s a good idea to double check' +
							' your tax, shipping, and payment configurations are set up correctly.' )
					}
				</p>
				<p>
					{
						translate( 'The easiest way to do this is to view your store, add' +
							' a product to your cart, and attempt to check out using different addresses.' )
					}
				</p>
			</BasicWidget>
		);
	}

	render = () => {
		return (
			<div className="dashboard__manage-no-orders">
				{ this.renderShareWidget() }
				{ this.renderReadingWidget() }
				<WidgetGroup>
					{ this.renderExampleOrderWidget() }
					{ this.renderViewAndTestWidget() }
				</WidgetGroup>
			</div>
		);
	}
}

export default localize( ManageNoOrders );
