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
import EmptyContent from 'calypso/components/empty-content';
import isBusinessPlanUser from 'calypso/state/selectors/is-business-plan-user';
import Main from 'calypso/components/main';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import PurchasesSite from '../purchases-site';
import MembershipSite from '../membership-site';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getPurchasesBySite, getSubscriptionsBySite } from 'calypso/lib/purchases';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import { getAllSubscriptions } from 'calypso/state/memberships/subscriptions/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getConciergeNextAppointment from 'calypso/state/selectors/get-concierge-next-appointment';
import getConciergeScheduleId from 'calypso/state/selectors/get-concierge-schedule-id.js';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import {
	CONCIERGE_HAS_UPCOMING_APPOINTMENT,
	CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
	CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
	CONCIERGE_SUGGEST_PURCHASE_CONCIERGE,
	CONCIERGE_WPCOM_BUSINESS_ID,
	CONCIERGE_WPCOM_SESSION_PRODUCT_ID,
} from 'calypso/me/concierge/constants';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import FormattedHeader from 'calypso/components/formatted-header';
import titles from 'calypso/me/purchases/titles';
import PurchasesListHeader from './purchases-list-header';

class PurchasesList extends Component {
	isDataLoading() {
		if ( this.props.isFetchingUserPurchases && ! this.props.hasLoadedUserPurchasesFromServer ) {
			return true;
		}

		return ! this.props.sites.length && ! this.props.subscriptions.length;
	}

	renderConciergeBanner() {
		const { nextAppointment, scheduleId } = this.props;

		if ( null === scheduleId ) {
			return (
				<ConciergeBanner bannerType={ CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION } showPlaceholder />
			);
		}

		let bannerType;

		if ( nextAppointment ) {
			bannerType = CONCIERGE_HAS_UPCOMING_APPOINTMENT;
		} else if ( scheduleId ) {
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

	renderMembershipSubscriptions() {
		const { subscriptions } = this.props;

		if ( ! subscriptions.length ) {
			return null;
		}

		return getSubscriptionsBySite( subscriptions ).map( ( site ) => (
			<MembershipSite site={ site } key={ site.id } />
		) );
	}

	render() {
		const { purchases, sites, translate, userId, subscriptions } = this.props;
		let content;

		if ( this.isDataLoading() ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && purchases.length ) {
			content = (
				<>
					{ this.renderConciergeBanner() }

					<PurchasesListHeader showSite={ true } />

					{ getPurchasesBySite( purchases, sites ).map( ( site ) => (
						<PurchasesSite
							key={ site.id }
							siteId={ site.id }
							name={ site.name }
							domain={ site.domain }
							slug={ site.slug }
							purchases={ site.purchases }
							showSite={ true }
						/>
					) ) }
				</>
			);
		}

		if (
			this.props.hasLoadedUserPurchasesFromServer &&
			! purchases.length &&
			! subscriptions.length
		) {
			if ( ! sites.length ) {
				return (
					<Main>
						<PageViewTracker path="/me/purchases" title="Purchases > No Sites" />
						<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
						<PurchasesNavigation section="purchases" />
						<NoSitesMessage />
					</Main>
				);
			}
			content = (
				<>
					{ this.renderConciergeBanner() }

					<CompactCard className="purchases-list__no-content">
						<EmptyContent
							title={ translate( 'Looking to upgrade?' ) }
							line={ translate(
								'Our plans give your site the power to thrive. ' +
									'Find the plan that works for you.'
							) }
							action={ translate( 'Upgrade now' ) }
							actionURL={ '/plans' }
							illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
						/>
					</CompactCard>
				</>
			);
		}

		return (
			<Main className="purchases-list is-wide-layout">
				<QueryUserPurchases userId={ userId } />
				<QueryMembershipsSubscriptions />
				<PageViewTracker path="/me/purchases" title="Purchases" />
				<MeSidebarNavigation />

				<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
				<PurchasesNavigation section="purchases" />
				{ content }
				{ this.renderMembershipSubscriptions() }
				<QueryConciergeInitial />
			</Main>
		);
	}
}

PurchasesList.propTypes = {
	isBusinessPlanUser: PropTypes.bool.isRequired,
	noticeType: PropTypes.string,
	purchases: PropTypes.oneOfType( [ PropTypes.array, PropTypes.bool ] ),
	subscriptions: PropTypes.array,
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
			subscriptions: getAllSubscriptions( state ),
			sites: getSites( state ),
			nextAppointment: getConciergeNextAppointment( state ),
			scheduleId: getConciergeScheduleId( state ),
			userId,
		};
	},
	{ recordTracksEvent }
)( localize( PurchasesList ) );
