/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PendingListItem from './pending-list-item';
import PurchasesHeader from '../purchases/purchases-list/header';
import PurchasesSite from '../purchases/purchases-site';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import Banner from 'components/banner';

export const requestId = userId => `pending-payments/${ userId }`;

const requestPendingPayments = userId => {
	return requestHttpData(
		requestId( userId ),
		http( {
			path: '/me/pending-payments',
			apiVersion: '1',
			method: 'GET',
			body: { userId },
		} ),
		{
			fromApi: () => pending => [ [ requestId( userId ), pending ] ],
			freshness: -Infinity,
		}
	);
};

export class PendingPayments extends Component {
	componentDidMount = () => {
		requestPendingPayments( this.props.userId );
	};

	// tofix: Something is wrong with this error handling.
	componentDidUpdate( prevProps ) {
		const prevResponse = prevProps.response;

		const { showErrorNotice, response, translate } = this.props;

		// Only show once when changing from non failure to failure
		if ( prevResponse && prevResponse.state !== 'failure' && response.state === 'failure' ) {
			showErrorNotice( translate( "We've encountered a problem. Please try again later." ) );
		}
	}

	render() {
		const { response, pendingPayments, translate } = this.props;

		let content;

		if ( response.state !== 'success' ) {
			// intentionally includes error states
			content = <PurchasesSite isPlaceholder={ true } />;
		} else if ( pendingPayments.length === 0 ) {
			content = (
				<CompactCard className="pending-payments__no-content">
					<EmptyContent
						title={ translate( 'Looking to upgrade?' ) }
						line={ translate(
							'Our plans give your site the power to thrive. Find the plan that works for you.'
						) }
						action={ translate( 'Upgrade Now' ) }
						actionURL={ '/plans' }
						illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
					/>
				</CompactCard>
			);
		} else if ( pendingPayments.length > 0 ) {
			content = (
				<React.Fragment>
					<Banner
						callToAction={ translate( 'Back to My Sites' ) }
						description={ translate(
							'Your payment initiation has been confirmed. We are currently waiting for the funds to clear, this transfer process can take up to one week to complete.'
						) }
						event="pending-payment-confirmation"
						icon="star"
						title={ translate( 'Thank you! Your payment is being processed.' ) }
					/>
					<div>
						{ pendingPayments.map( purchase => (
							<PendingListItem key={ purchase.orderId } { ...purchase } />
						) ) }
					</div>
				</React.Fragment>
			);
		}

		return (
			<Main className="pending-payments">
				<PageViewTracker path="/me/purchases/pending" title="Pending Payments" />
				<MeSidebarNavigation />
				<PurchasesHeader section="pending" />
				{ content }
			</Main>
		);
	}
}

PendingPayments.propTypes = {
	userId: PropTypes.number.isRequired,
	pendingPayments: PropTypes.array.isRequired,
	response: PropTypes.object,
	showErrorNotice: PropTypes.func,
};

export default connect(
	state => {
		const userId = getCurrentUserId( state );

		const response = getHttpData( requestId( userId ) );

		const data = Object.values( response.data || [] );

		const pending = [];

		for ( const payment of data ) {
			pending.push( {
				orderId: payment.order_id,
				siteId: payment.site_id,
				paymentMethod: payment.payment_method,
				paymentType: payment.payment_type,
				redirectUrl: payment.redirect_url,
				totalCost: payment.total_cost,
				currency: payment.currency,
				dateCreated: payment.date_created,
				dateUpdated: payment.date_status_update,
				products: payment.products,
			} );
		}

		return {
			userId,
			pendingPayments: pending,
			response: response,
		};
	},
	dispatch => ( {
		showErrorNotice: ( error, options ) =>
			dispatch(
				errorNotice( error, Object.assign( {}, options, { id: 'pending-payments-tab' } ) )
			),
	} )
)( localize( PendingPayments ) );
