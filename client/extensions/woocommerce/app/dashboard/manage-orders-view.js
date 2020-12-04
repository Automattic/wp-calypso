/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from 'calypso/config';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	areCountsLoaded,
	getCountNewOrders,
	getCountPendingReviews,
} from 'woocommerce/state/sites/data/counts/selectors';
import { Button } from '@automattic/components';
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import DashboardWidgetRow from 'woocommerce/components/dashboard-widget/row';
import LabelsSetupNotice from 'woocommerce/woocommerce-services/components/labels-setup-notice';
import { fetchCounts } from 'woocommerce/state/sites/data/counts/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import InventoryWidget from './widgets/inventory-widget';
import ShareWidget from 'woocommerce/components/share-widget';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import StatsWidget from './widgets/stats-widget';

class ManageOrdersView extends Component {
	static propTypes = {
		fetchCounts: PropTypes.func,
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
			URL: PropTypes.string.isRequired,
		} ),
		totalNewOrders: PropTypes.number,
		totalPendingReviews: PropTypes.number,
		translate: PropTypes.func.isRequired,
		user: PropTypes.shape( {
			display_name: PropTypes.string,
			username: PropTypes.string.isRequired,
		} ),
	};

	componentDidMount() {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.fetchData();
		}
	}

	componentDidUpdate( prevProps ) {
		const { site } = this.props;
		const siteId = site ? site.ID : null;
		const oldSiteId = prevProps.site ? prevProps.site.ID : null;

		if ( siteId && oldSiteId !== siteId ) {
			this.fetchData();
		}
	}

	fetchData = () => {
		const { isLoaded, site } = this.props;
		if ( ! isLoaded ) {
			this.props.fetchCounts( site.ID );
		}
	};

	possiblyRenderProcessOrdersWidget = () => {
		const { site, totalNewOrders, totalPendingReviews, translate } = this.props;
		if ( ! totalNewOrders ) {
			return null;
		}
		const orderCountPhrase = translate( '✨ New order', '✨ New orders', {
			count: totalNewOrders,
		} );
		const classes = classNames( 'dashboard__process-orders-container', {
			'has-reviews': totalPendingReviews,
		} );
		return (
			<DashboardWidgetRow className={ classes }>
				<DashboardWidget className="dashboard__process-orders-total">
					<span className="dashboard__process-orders-value">{ totalNewOrders }</span>
					<span className="dashboard__process-orders-label">{ orderCountPhrase }</span>
				</DashboardWidget>
				<DashboardWidget className="dashboard__process-orders-action">
					<Button href={ getLink( '/store/orders/:site', site ) }>
						{ translate( 'Process orders' ) }
					</Button>
				</DashboardWidget>
			</DashboardWidgetRow>
		);
	};

	possiblyRenderReviewsWidget = () => {
		const { site, totalPendingReviews, translate } = this.props;
		if ( ! totalPendingReviews ) {
			return null;
		}

		const countText = translate( '%d pending review', '%d pending reviews', {
			args: [ totalPendingReviews ],
			count: totalPendingReviews,
		} );

		return (
			<DashboardWidget className="dashboard__reviews-widget" title={ countText } width="third">
				<Button href={ getLink( '/store/reviews/:site', site ) }>
					{ translate( 'Moderate', { context: 'Product reviews widget moderation button' } ) }
				</Button>
			</DashboardWidget>
		);
	};

	possiblyRenderShareWidget = () => {
		// TODO - connect to display preferences in a follow-on PR
		const { site, translate } = this.props;
		return (
			<ShareWidget
				text={ translate( 'Spread the news about your new store.' ) }
				title={ translate( 'Share with your world' ) }
				urlToShare={ site.URL }
			/>
		);
	};

	// TODO Remove this check once the dashboard stats widget is launched in production.
	possiblyRenderReportsWidget = () => {
		const { site, translate, totalNewOrders } = this.props;

		if ( config.isEnabled( 'woocommerce/extension-dashboard-stats-widget' ) ) {
			return null;
		}

		return (
			<DashboardWidget
				className="dashboard__reports-widget"
				image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
				imagePosition="left"
				title={ translate( 'Reports' ) }
			>
				<p>
					{ translate(
						'See a detailed breakdown of how your store is doing on the stats screen.'
					) }
				</p>
				<p>
					<Button href={ getLink( '/store/stats/orders/week/:site', site ) }>
						{ totalNewOrders ? translate( 'View full reports' ) : translate( 'View reports' ) }
					</Button>
				</p>
			</DashboardWidget>
		);
	};

	renderInventoryWidget = () => {
		return <InventoryWidget width="full" />;
	};

	render() {
		const { site, totalNewOrders, translate, user } = this.props;
		return (
			<div className="dashboard__manage-has-orders">
				<QuerySettingsGeneral siteId={ site && site.ID } />
				<div className="dashboard__manage-has-orders-header">
					<h2>
						{ translate( 'Hi, {{storeOwnerName/}}.', {
							components: {
								storeOwnerName: <strong>{ user.display_name || user.username }</strong>,
							},
						} ) }
						{ ( totalNewOrders && <span>{ translate( 'You have new orders 🎉' ) }</span> ) || '' }
					</h2>
				</div>

				<LabelsSetupNotice />

				<DashboardWidgetRow>
					{ this.possiblyRenderProcessOrdersWidget() }
					{ this.possiblyRenderReviewsWidget() }
				</DashboardWidgetRow>

				{ config.isEnabled( 'woocommerce/extension-dashboard-stats-widget' ) && <StatsWidget /> }

				{ this.renderInventoryWidget() }

				{ this.possiblyRenderShareWidget() }
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const isLoaded = areCountsLoaded( state );
	const totalNewOrders = getCountNewOrders( state );
	const totalPendingReviews = getCountPendingReviews( state );
	const user = getCurrentUser( state );

	return {
		isLoaded,
		site,
		totalNewOrders,
		totalPendingReviews,
		user,
	};
}

export default connect( mapStateToProps, { fetchCounts } )( localize( ManageOrdersView ) );
