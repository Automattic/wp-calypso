/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import config from 'config';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import LabelsSetupNotice from 'woocommerce/woocommerce-services/components/labels-setup-notice';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { fetchReviews } from 'woocommerce/state/sites/reviews/actions';
import {
	areOrdersLoading,
	areOrdersLoaded,
	getNewOrdersWithoutPayPalPending,
	getNewOrdersWithoutPayPalPendingRevenue,
} from 'woocommerce/state/sites/orders/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { getTotalReviews } from 'woocommerce/state/sites/reviews/selectors';
import ProcessOrdersWidget from 'woocommerce/components/process-orders-widget';
import ShareWidget from 'woocommerce/components/share-widget';
import Card from 'components/card';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class ManageOrdersView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
			URL: PropTypes.string.isRequired,
		} ),
		fetchOrders: PropTypes.func,
		currency: PropTypes.shape( {
			value: PropTypes.string,
		} ),
		orders: PropTypes.array,
		ordersRevenue: PropTypes.number,
		ordersLoading: PropTypes.bool,
		ordersLoaded: PropTypes.bool,
		user: PropTypes.shape( {
			display_name: PropTypes.string,
			username: PropTypes.string.isRequired,
		} ),
	};

	componentDidMount() {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchOrders( site.ID );
			// TODO This check can be removed when we launch reviews.
			if ( config.isEnabled( 'woocommerce/extension-reviews' ) ) {
				this.props.fetchReviews( site.ID, { status: 'pending' } );
			}
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchOrders( newSiteId );
			// TODO This check can be removed when we launch reviews.
			if ( config.isEnabled( 'woocommerce/extension-reviews' ) ) {
				this.props.fetchReviews( newSiteId, { status: 'pending' } );
			}
		}
	}

	possiblyRenderProcessOrdersWidget = () => {
		const { site, orders, ordersRevenue, currency } = this.props;
		if ( ! orders.length ) {
			return null;
		}
		return (
			<ProcessOrdersWidget
				className="dashboard__process-orders-widget"
				site={ site }
				orders={ orders }
				ordersRevenue={ ordersRevenue }
				currency={ currency }
			/>
		);
	};

	possiblyRenderReviewsWidget = () => {
		const { site, pendingReviews, translate } = this.props;
		if ( ! pendingReviews ) {
			return null;
		}

		const classes = classNames( 'card', 'dashboard__reviews-widget' );
		const countText = translate( 'Pending review', 'Pending reviews', {
			count: pendingReviews,
		} );

		return (
			<div className={ classes }>
				<div>
					<span>{ pendingReviews }</span>
					<span>{ countText }</span>
				</div>
				<div>
					<Button href={ getLink( '/store/reviews/:site', site ) }>
						{ translate( 'Moderate', { context: 'Product reviews widget moderation button' } ) }
					</Button>
				</div>
			</div>
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

	render = () => {
		const { site, translate, orders, user } = this.props;
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
						{ ( orders.length && <span>{ translate( 'You have new orders 🎉' ) }</span> ) || '' }
					</h2>
				</div>

				<LabelsSetupNotice />

				<div className="dashboard__queue-widgets">
					{ this.possiblyRenderProcessOrdersWidget() }
					{ config.isEnabled( 'woocommerce/extension-reviews' ) &&
						this.possiblyRenderReviewsWidget() }
				</div>

				<Card className="dashboard__reports-widget">
					<div className="dashboard__reports-widget-content-wrapper">
						<img src="/calypso/images/extensions/woocommerce/woocommerce-reports.svg" alt="" />
						<div className="dashboard__reports-widget-content">
							<h2>{ translate( 'Reports' ) }</h2>
							<p>
								{ translate(
									'See a detailed breakdown of how your store is doing on the stats screen.'
								) }
							</p>
							<p>
								<Button href={ getLink( '/store/stats/orders/day/:site', site ) }>
									{ orders.length ? translate( 'View full reports' ) : translate( 'View reports' ) }
								</Button>
							</p>
						</div>
					</div>
				</Card>
				{ this.possiblyRenderShareWidget() }
			</div>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const ordersLoading = areOrdersLoading( state );
	const ordersLoaded = areOrdersLoaded( state );
	const orders = getNewOrdersWithoutPayPalPending( state );
	const ordersRevenue = getNewOrdersWithoutPayPalPendingRevenue( state );
	const user = getCurrentUser( state );
	const currency = getPaymentCurrencySettings( state );
	const pendingReviews = getTotalReviews( state, { status: 'pending' } );
	return {
		site,
		orders,
		ordersRevenue,
		ordersLoading,
		ordersLoaded,
		user,
		currency,
		pendingReviews,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchOrders,
			fetchReviews,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ManageOrdersView ) );
