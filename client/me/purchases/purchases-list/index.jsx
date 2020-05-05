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
import { CompactCard } from '@automattic/components';
import ConciergeBanner from '../concierge-banner';
import EmptyContent from 'components/empty-content';
import isBusinessPlanUser from 'state/selectors/is-business-plan-user';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PurchasesHeader from './header';
import PurchasesSite from '../purchases-site';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getPurchasesBySite } from 'lib/purchases';
import getSites from 'state/selectors/get-sites';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'state/purchases/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import getConciergeNextAppointment from 'state/selectors/get-concierge-next-appointment';
import getHasAvailableConciergeSessions from 'state/selectors/get-concierge-has-available-sessions.js';
import getConciergeScheduleId from 'state/selectors/get-concierge-schedule-id.js';
import QueryConciergeInitial from 'components/data/query-concierge-initial';
import {
	CONCIERGE_HAS_UPCOMING_APPOINTMENT,
	CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
	CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
	CONCIERGE_SUGGEST_PURCHASE_CONCIERGE,
	CONCIERGE_WPCOM_BUSINESS_ID,
	CONCIERGE_WPCOM_SESSION_PRODUCT_ID,
} from 'me/concierge/constants';
import NoSitesMessage from 'components/empty-content/no-sites-message';

class PurchasesList extends Component {
	isDataLoading() {
		if ( this.props.isFetchingUserPurchases && ! this.props.hasLoadedUserPurchasesFromServer ) {
			return true;
		}

		return ! this.props.sites.length;
	}

	renderConciergeBanner() {
		const { nextAppointment, scheduleId, hasAvailableConciergeSessions } = this.props;

		if ( null === hasAvailableConciergeSessions ) {
			return (
				<ConciergeBanner bannerType={ CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION } showPlaceholder />
			);
		}

		let bannerType;

		if ( nextAppointment ) {
			bannerType = CONCIERGE_HAS_UPCOMING_APPOINTMENT;
		} else if ( hasAvailableConciergeSessions ) {
			switch ( scheduleId ) {
				case CONCIERGE_WPCOM_BUSINESS_ID:
					bannerType = CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION;
					break;

				case CONCIERGE_WPCOM_SESSION_PRODUCT_ID:
					bannerType = CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION;
					break;

				default:
					bannerType = CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION;
			}
		} else {
			bannerType = CONCIERGE_SUGGEST_PURCHASE_CONCIERGE;
		}

		return (
			<ConciergeBanner
				bannerType={ bannerType }
				recordTracksEvent={ this.props.recordTracksEvent }
			/>
		);
	}

	render() {
		let content;

		if ( this.isDataLoading() ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && this.props.purchases.length ) {
			content = (
				<div>
					{ this.renderConciergeBanner() }

					{ getPurchasesBySite( this.props.purchases, this.props.sites ).map( ( site ) => (
						<PurchasesSite
							key={ site.id }
							siteId={ site.id }
							name={ site.name }
							domain={ site.domain }
							slug={ site.slug }
							purchases={ site.purchases }
						/>
					) ) }
				</div>
			);
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && ! this.props.purchases.length ) {
			if ( ! this.props.sites.length ) {
				return (
					<Main>
						<PageViewTracker path="/me/purchases" title="Purchases > No Sites" />
						<PurchasesHeader section="purchases" />
						<NoSitesMessage />
					</Main>
				);
			}
			content = (
				<>
					{ this.renderConciergeBanner() }

					<CompactCard className="purchases-list__no-content">
						<EmptyContent
							title={ this.props.translate( 'Looking to upgrade?' ) }
							line={ this.props.translate(
								'Our plans give your site the power to thrive. ' +
									'Find the plan that works for you.'
							) }
							action={ this.props.translate( 'Upgrade now' ) }
							actionURL={ '/plans' }
							illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
						/>
					</CompactCard>
				</>
			);
		}

		return (
			<Main className="purchases-list">
				<QueryUserPurchases userId={ this.props.userId } />
				<PageViewTracker path="/me/purchases" title="Purchases" />
				<MeSidebarNavigation />
				<PurchasesHeader section="purchases" />
				{ content }
				<QueryConciergeInitial />
			</Main>
		);
	}
}

PurchasesList.propTypes = {
	isBusinessPlanUser: PropTypes.bool.isRequired,
	noticeType: PropTypes.string,
	purchases: PropTypes.oneOfType( [ PropTypes.array, PropTypes.bool ] ),
	sites: PropTypes.array.isRequired,
	userId: PropTypes.number.isRequired,
};

export default connect(
	( state ) => {
		const userId = getCurrentUserId( state );
		return {
			hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
			isBusinessPlanUser: isBusinessPlanUser( state ),
			isFetchingUserPurchases: isFetchingUserPurchases( state ),
			purchases: getUserPurchases( state, userId ),
			sites: getSites( state ),
			nextAppointment: getConciergeNextAppointment( state ),
			hasAvailableConciergeSessions: getHasAvailableConciergeSessions( state ),
			scheduleId: getConciergeScheduleId( state ),
			userId,
		};
	},
	{ recordTracksEvent }
)( localize( PurchasesList ) );
