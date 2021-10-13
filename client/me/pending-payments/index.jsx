import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import Banner from 'calypso/components/banner';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getStatsPathForTab } from 'calypso/lib/route';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getHttpData, requestHttpData } from 'calypso/state/data-layer/http-data';
import { convertToCamelCase } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PurchasesSite from '../purchases/purchases-site';
import PendingListItem from './pending-list-item';

import './style.scss';

export const requestId = ( userId ) => `pending-payments:${ userId }`;

const requestPendingPayments = ( userId ) => {
	return requestHttpData(
		requestId( userId ),
		http( {
			path: '/me/pending-payments',
			apiVersion: '1',
			method: 'GET',
		} ),
		{
			fromApi: () => ( pending ) => [ [ requestId( userId ), convertToCamelCase( pending ) ] ],
			freshness: -Infinity,
		}
	);
};

export class PendingPayments extends Component {
	componentDidMount = () => {
		requestPendingPayments( this.props.userId );
	};

	componentDidUpdate( prevProps ) {
		const prevResponse = prevProps.response;

		const { showErrorNotice, response, translate } = this.props;

		// Only show once when changing from non failure to failure
		if ( prevResponse && prevResponse.state !== 'failure' && response.state === 'failure' ) {
			showErrorNotice( translate( "We've encountered a problem. Please try again later." ) );
		}
	}

	render() {
		const { response, pendingPayments, translate, siteSlug } = this.props;

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
						action={ translate( 'Upgrade now' ) }
						actionURL={ '/plans' }
						illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
					/>
				</CompactCard>
			);
		} else if ( pendingPayments.length > 0 ) {
			content = (
				<Fragment>
					<Banner
						callToAction={ translate( 'Back to My Sites' ) }
						description={ translate(
							'Your payment initiation has been confirmed. We are currently waiting for the funds to clear, this transfer process can take up to one week to complete.'
						) }
						event="pending-payment-confirmation"
						icon="star"
						href={ getStatsPathForTab( 'day', siteSlug ) }
						title={ translate( 'Thank you! Your payment is being processed.' ) }
					/>
					<div>
						{ pendingPayments.map( ( purchase ) => (
							<PendingListItem key={ purchase.orderId } { ...purchase } />
						) ) }
					</div>
				</Fragment>
			);
		}

		return (
			<Main wideLayout className="pending-payments">
				<PageViewTracker path="/me/purchases/pending" title="Pending Payments" />
				<MeSidebarNavigation />
				<PurchasesNavigation section="pendingPayments" />
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
	( state ) => {
		const userId = getCurrentUserId( state );
		const response = getHttpData( requestId( userId ) );
		const siteId = getSelectedSiteId( state ) || getPrimarySiteId( state );

		return {
			userId,
			pendingPayments: Object.values( response.data || [] ),
			response: response,
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	( dispatch ) => ( {
		showErrorNotice: ( error, options ) =>
			dispatch(
				errorNotice( error, Object.assign( {}, options, { id: 'pending-payments-tab' } ) )
			),
	} )
)( localize( PendingPayments ) );
