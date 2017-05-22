/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import BasicWidget from '../../components/basic-widget';
import { getLink } from '../../lib/nav-utils';
import ReadingWidget from '../../components/reading-widget';
import ShareWidget from '../../components/share-widget';
import WidgetGroup from '../../components/widget-group';

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
				text={ translate( 'Now that your setup is complete it\'s time to spread the word' +
					' and get those first orders rolling in. Share a link with your friends,' +
					' family & followers now.' ) }
				title={ translate( 'Your store is ready & the world is waiting!' ) }
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
				text={ translate( 'Choice articles for new store owners to read. Get tips' +
					' from seasoned merchants, learn best practices to keep your store' +
					' ship-shape and prepare for success.' ) }
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
						translate( 'Your store is live. You may want to double check' +
							' your tax, shipping and payment configuration are set up correctly.' )
					}
				</p>
				<p>
					{
						translate( 'The easiest way to do this is to view your store, add' +
							' a product to your cart and attempt to check out using different addresses.' )
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
