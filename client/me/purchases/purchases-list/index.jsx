import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import EmptyContent from 'calypso/components/empty-content';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getPurchasesBySite, getSubscriptionsBySite } from 'calypso/lib/purchases';
import { PurchaseListConciergeBanner } from 'calypso/me/purchases/purchases-list/purchase-list-concierge-banner';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import titles from 'calypso/me/purchases/titles';
import { withStoredPaymentMethods } from 'calypso/my-sites/checkout/composite-checkout/hooks/use-stored-payment-methods';
import { getAllSubscriptions } from 'calypso/state/memberships/subscriptions/selectors';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';
import getAvailableConciergeSessions from 'calypso/state/selectors/get-available-concierge-sessions';
import getConciergeNextAppointment from 'calypso/state/selectors/get-concierge-next-appointment';
import getConciergeUserBlocked from 'calypso/state/selectors/get-concierge-user-blocked';
import getSites from 'calypso/state/selectors/get-sites';
import { getSiteId } from 'calypso/state/sites/selectors';
import MembershipSite from '../membership-site';
import PurchasesSite from '../purchases-site';
import PurchasesListHeader from './purchases-list-header';

class PurchasesList extends Component {
	isDataLoading() {
		if ( this.props.isFetchingUserPurchases && ! this.props.hasLoadedUserPurchasesFromServer ) {
			return true;
		}

		return ! this.props.sites.length && ! this.props.subscriptions.length;
	}

	renderConciergeBanner() {
		const { nextAppointment, availableSessions, isUserBlocked } = this.props;
		return (
			<PurchaseListConciergeBanner
				nextAppointment={ nextAppointment }
				availableSessions={ availableSessions }
				isUserBlocked={ isUserBlocked }
			/>
		);
	}

	renderMembershipSubscriptions() {
		const { subscriptions } = this.props;

		if ( ! subscriptions.length || this.isDataLoading() ) {
			return null;
		}

		return getSubscriptionsBySite( subscriptions ).map( ( site ) => (
			<MembershipSite site={ site } key={ site.id } />
		) );
	}

	render() {
		const { purchases, sites, translate, subscriptions } = this.props;
		let content;

		if ( this.isDataLoading() ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( purchases && purchases.length ) {
			content = (
				<>
					{ this.renderConciergeBanner() }

					<PurchasesListHeader showSite={ true } />

					{ getPurchasesBySite( purchases, sites ).map( ( site ) => (
						<PurchasesSite
							key={ site.id }
							siteId={ site.id }
							name={ site.name }
							slug={ site.slug }
							purchases={ site.purchases }
							showSite={ true }
							cards={ this.props.paymentMethodsState.paymentMethods }
						/>
					) ) }
				</>
			);
		}

		if ( purchases && ! purchases.length && ! subscriptions.length ) {
			if ( ! sites.length ) {
				return (
					<Main wideLayout className="purchases-list">
						<PageViewTracker path="/me/purchases" title="Purchases > No Sites" />
						<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
						<PurchasesNavigation section="activeUpgrades" />
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
							actionURL="/plans"
							illustration="/calypso/images/illustrations/illustration-nosites.svg"
						/>
					</CompactCard>
				</>
			);
		}

		return (
			<Main wideLayout className="purchases-list">
				<QueryUserPurchases />
				<QueryMembershipsSubscriptions />
				<PageViewTracker path="/me/purchases" title="Purchases" />

				<FormattedHeader
					brandFont
					headerText={ titles.sectionTitle }
					subHeaderText={ translate(
						'View, manage, or cancel your plan and other purchases. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="purchases" showIcon={ false } />,
							},
						}
					) }
					align="left"
				/>
				<PurchasesNavigation section="activeUpgrades" />
				{ content }
				{ this.renderMembershipSubscriptions() }
				<QueryConciergeInitial />
			</Main>
		);
	}
}

PurchasesList.propTypes = {
	noticeType: PropTypes.string,
	purchases: PropTypes.array,
	subscriptions: PropTypes.array,
	sites: PropTypes.array,
};

export default connect( ( state ) => ( {
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	isFetchingUserPurchases: isFetchingUserPurchases( state ),
	purchases: getUserPurchases( state ),
	subscriptions: getAllSubscriptions( state ),
	sites: getSites( state ),
	nextAppointment: getConciergeNextAppointment( state ),
	isUserBlocked: getConciergeUserBlocked( state ),
	availableSessions: getAvailableConciergeSessions( state ),
	siteId: getSiteId( state ),
} ) )( withStoredPaymentMethods( localize( PurchasesList ), { type: 'card', expired: true } ) );
