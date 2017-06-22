/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { fetchOrder } from 'woocommerce/state/sites/orders/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getOrder } from 'woocommerce/state/sites/orders/selectors';
import Main from 'components/main';
import OrderActivityLog from './order-activity-log';
import OrderCustomerInfo from './order-customer-info';
import OrderDetails from './order-details';
import OrderHeader from '../orders/order-header';

class Order extends Component {
	componentDidMount() {
		const { siteId, orderId } = this.props;

		if ( siteId ) {
			this.props.fetchOrder( siteId, orderId );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.orderId !== this.props.orderId || newProps.siteId !== this.props.siteId ) {
			this.props.fetchOrder( newProps.siteId, newProps.orderId );
		}
	}

	render() {
		const { className, order, site, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const breadcrumbs = ( <span>
			<a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a> &gt; { translate( 'Order Details' ) }
		</span> );

		return (
			<Main className={ className }>
				<OrderHeader siteSlug={ site.slug } breadcrumbs={ breadcrumbs } />

				<div className="order__container">
					<OrderDetails order={ order } />
					<OrderActivityLog order={ order } />
					<OrderCustomerInfo order={ order } />
				</div>
			</Main>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const orderId = props.params.order;
		const order = getOrder( state, orderId );

		return {
			siteId,
			site,
			orderId,
			order
		};
	},
	dispatch => bindActionCreators( { fetchOrder }, dispatch )
)( localize( Order ) );
