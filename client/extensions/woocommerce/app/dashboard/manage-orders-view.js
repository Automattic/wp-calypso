/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from 'config';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import DashboardWidgetRow from 'woocommerce/components/dashboard-widget/row';
import LabelsSetupNotice from 'woocommerce/woocommerce-services/components/labels-setup-notice';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { fetchReviews } from 'woocommerce/state/sites/reviews/actions';
import formatCurrency from 'lib/format-currency';
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
import ShareWidget from 'woocommerce/components/share-widget';
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
		const { ordersLoaded, site } = this.props;

		if ( site && site.ID ) {
			this.fetchData( { siteId: site.ID, ordersLoaded } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( oldSiteId !== newSiteId ) {
			this.fetchData( { ...newProps, siteId: newSiteId } );
		}
	}

	fetchData = ( { siteId, ordersLoaded } ) => {
		if ( ! ordersLoaded ) {
			this.props.fetchOrders( siteId );
		}
		// TODO This check can be removed when we launch reviews.
		if ( config.isEnabled( 'woocommerce/extension-reviews' ) ) {
			this.props.fetchReviews( siteId, { status: 'pending' } );
		}
	};

	shouldShowPendingReviews = () => {
		return config.isEnabled( 'woocommerce/extension-reviews' ) && this.props.pendingReviews;
	};

	possiblyRenderProcessOrdersWidget = () => {
		const { currency, orders, ordersRevenue, site, translate } = this.props;
		if ( ! orders.length ) {
			return null;
		}
		const currencyValue = ( currency && currency.value ) || '';
		const orderCountPhrase = translate( '✨ New order', '✨ New orders', {
			count: orders.length,
		} );
		const classes = classNames( 'dashboard__process-orders-container', {
			'has-reviews': this.shouldShowPendingReviews(),
		} );
		return (
			<DashboardWidgetRow className={ classes }>
				<DashboardWidget className="dashboard__process-orders-total">
					<span className="dashboard__process-orders-value">{ orders.length }</span>
					<span className="dashboard__process-orders-label">{ orderCountPhrase }</span>
				</DashboardWidget>
				<DashboardWidget className="dashboard__process-orders-revenue">
					<span className="dashboard__process-orders-value">
						{ formatCurrency( ordersRevenue, currencyValue ) || ordersRevenue }
					</span>
					<span className="dashboard__process-orders-label">{ translate( '💰 Revenue' ) }</span>
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
		if ( ! this.shouldShowPendingReviews() ) {
			return null;
		}

		const { site, pendingReviews, translate } = this.props;
		const countText = translate( '%d pending review', '%d pending reviews', {
			args: [ pendingReviews ],
			count: pendingReviews,
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

	render() {
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

				<DashboardWidgetRow>
					{ this.possiblyRenderProcessOrdersWidget() }
					{ this.possiblyRenderReviewsWidget() }
				</DashboardWidgetRow>

				<DashboardWidget
					className="dashboard__reports-widget"
					image="/calypso/images/extensions/woocommerce/woocommerce-reports.svg"
					imagePosition="right"
					title={ translate( 'Reports' ) }
				>
					<p>
						{ translate(
							'See a detailed breakdown of how your store is doing on the stats screen.'
						) }
					</p>
					<p>
						<Button href={ getLink( '/store/stats/orders/week/:site', site ) }>
							{ orders.length ? translate( 'View full reports' ) : translate( 'View reports' ) }
						</Button>
					</p>
				</DashboardWidget>

				{ this.possiblyRenderShareWidget() }
			</div>
		);
	}
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
