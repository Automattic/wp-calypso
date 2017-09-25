/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { getCurrentUser } from 'state/current-user/selectors';
import ProcessOrdersWidget from 'woocommerce/components/process-orders-widget';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import ShareWidget from 'woocommerce/components/share-widget';
import { getLink } from 'woocommerce/lib/nav-utils';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { areOrdersLoading, areOrdersLoaded, getNewOrders, getNewOrdersRevenue } from 'woocommerce/state/sites/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';

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
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchOrders( newSiteId );
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
	}

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
	}

	render = () => {
		const { site, translate, orders, user } = this.props;
		return (
			<div className="dashboard__manage-has-orders">
				<QuerySettingsGeneral siteId={ site && site.ID } />
				<div className="dashboard__manage-has-orders-header">
					<h2>
						{ translate( 'Hi, {{storeOwnerName/}}.', {
							components: {
								storeOwnerName: <strong>{ user.display_name || user.username }</strong>
							}
						} ) }
						{ orders.length && (
							<span>{ translate( 'You have new orders 🎉' ) }</span>
						) || '' }
					</h2>
				</div>
				{ this.possiblyRenderProcessOrdersWidget() }
				<Card
					className="dashboard__reports-widget"
				>
					<div className="dashboard__reports-widget-content-wrapper">
						<img src="/calypso/images/extensions/woocommerce/woocommerce-reports.svg" alt="" />
						<div className="dashboard__reports-widget-content">
							<h2>
								{ translate( 'Reports' ) }
							</h2>
							<p>
								{ translate( 'See a detailed breakdown of how your store is doing on the stats screen.' ) }
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
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const ordersLoading = areOrdersLoading( state );
	const ordersLoaded = areOrdersLoaded( state );
	const orders = getNewOrders( state );
	const ordersRevenue = getNewOrdersRevenue( state );
	const user = getCurrentUser( state );
	const currency = getPaymentCurrencySettings( state );
	return {
		site,
		orders,
		ordersRevenue,
		ordersLoading,
		ordersLoaded,
		user,
		currency,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchOrders,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ManageOrdersView ) );
