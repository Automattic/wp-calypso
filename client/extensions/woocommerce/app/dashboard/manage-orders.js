/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';
import ProcessOrdersWidget from 'woocommerce/components/process-orders-widget';
import ReadingWidget from 'woocommerce/components/reading-widget';
import ShareWidget from 'woocommerce/components/share-widget';

class ManageOrders extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
		} ),
	};

	renderProcessOrdersWidget = () => {
		return (
			<ProcessOrdersWidget className="dashboard__process-orders-widget" />
		);
	}

	possiblyRenderShareWidget = () => {
		// TODO - connect to display preferences in a follow-on PR
		const { site, translate } = this.props;
		return (
			<ShareWidget
				text={ translate( 'Share a link to your store on social media.' ) }
				title={ translate( 'Share your store' ) }
				urlToShare={ getLink( 'https://:site', site ) }
			/>
		);
	}

	possiblyRenderReadingWidget = () => {
		// TODO - connect to display preferences in a follow-on PR
		const { site, translate } = this.props;
		return (
			<ReadingWidget
				site={ site }
				text={ translate( 'You’re not alone! Get tips from seasoned merchants,' +
					' learn best practices to keep your store ship-shape,' +
					' and find how to boost your sales and drive traffic.' ) }
				title={ translate( 'Recommended reading' ) }
			/>
		);
	}

	render = () => {
		const { site, translate } = this.props;
		// TODO - replace store owner with current user's first name
		return (
			<div className="dashboard__manage-has-orders">
				<div className="dashboard__manage-has-orders-header">
					<h2>
						{ translate( 'Welcome back, store owner' ) }
						<br />
						{ translate( 'You have new orders to process' ) }
					</h2>
				</div>
				{ this.renderProcessOrdersWidget() }
				<div className="dashboard__manage-has-orders-stats-actions">
					<Button href={ getLink( '/store/stats/orders/day/:site', site ) }>
						{ translate( 'View full reports' ) }
					</Button>
				</div>
				{ this.possiblyRenderShareWidget() }
				{ this.possiblyRenderReadingWidget() }
			</div>
		);
	}
}

export default localize( ManageOrders );
