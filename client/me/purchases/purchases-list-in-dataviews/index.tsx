import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CompactCard } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { LocalizeProps, localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import noSitesIllustration from 'calypso/assets/images/illustrations/illustration-nosites.svg';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import EmptyContent from 'calypso/components/empty-content';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { MembershipSubscription, Purchase } from 'calypso/lib/purchases/types';
import { PurchaseListConciergeBanner } from 'calypso/me/purchases/purchases-list/purchase-list-concierge-banner';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import titles from 'calypso/me/purchases/titles';
import {
	WithStoredPaymentMethodsProps,
	withStoredPaymentMethods,
} from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { getAllSubscriptions } from 'calypso/state/memberships/subscriptions/selectors';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';
import getAvailableConciergeSessions from 'calypso/state/selectors/get-available-concierge-sessions';
import getConciergeNextAppointment, {
	NextAppointment,
} from 'calypso/state/selectors/get-concierge-next-appointment';
import getConciergeUserBlocked from 'calypso/state/selectors/get-concierge-user-blocked';
import getSites from 'calypso/state/selectors/get-sites';
import { getSiteId } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';
import PurchasesSite from '../purchases-site';
import { PurchasesDataViews, MembershipsDataViews } from './purchases-data-view';
import './style.scss';

export interface PurchasesListProps {
	noticeType?: string | undefined;
}

export interface PurchasesListConnectedProps {
	hasLoadedUserPurchasesFromServer: boolean;
	isFetchingUserPurchases: boolean;
	purchases: Purchase[] | null;
	subscriptions: MembershipSubscription[];
	sites: SiteDetails[];
	nextAppointment: NextAppointment | null;
	isUserBlocked: boolean;
	availableSessions: number[];
	siteId: number | null;
}

function MembershipSubscriptions( {
	memberships,
}: {
	memberships: Array< MembershipSubscription >;
} ) {
	if ( ! memberships.length ) {
		return null;
	}

	return <MembershipsDataViews memberships={ memberships } />;
}

function isDataLoading( {
	isFetchingUserPurchases,
	hasLoadedUserPurchasesFromServer,
}: {
	hasLoadedUserPurchasesFromServer: boolean;
	isFetchingUserPurchases: boolean;
} ) {
	if ( isFetchingUserPurchases && ! hasLoadedUserPurchasesFromServer ) {
		return true;
	}
}

class PurchasesListDataView extends Component<
	PurchasesListProps & PurchasesListConnectedProps & WithStoredPaymentMethodsProps & LocalizeProps
> {
	renderConciergeBanner() {
		const { nextAppointment, availableSessions, isUserBlocked } = this.props;
		return (
			<PurchaseListConciergeBanner
				nextAppointment={ nextAppointment ?? undefined }
				availableSessions={ availableSessions }
				isUserBlocked={ isUserBlocked }
			/>
		);
	}

	render() {
		const { purchases, sites, translate, subscriptions } = this.props;
		const commonEventProps = { context: 'me' };
		let content;

		if (
			isDataLoading( {
				isFetchingUserPurchases: this.props.isFetchingUserPurchases,
				hasLoadedUserPurchasesFromServer: this.props.hasLoadedUserPurchasesFromServer,
			} )
		) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( purchases && purchases.length ) {
			content = <PurchasesDataViews purchases={ purchases } />;
		}

		if ( purchases && ! purchases.length && ! subscriptions.length ) {
			if ( ! sites.length ) {
				return (
					<Main wideLayout className="purchases-list">
						<PageViewTracker path="/me/purchases" title="Purchases > No Sites" />
						<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />
						<PurchasesNavigation section="activeUpgrades" />
						<NoSitesMessage />
					</Main>
				);
			}
			content = (
				<>
					{ this.renderConciergeBanner() }
					<CompactCard className="purchases-list__no-content">
						<>
							<TrackComponentView
								eventName="calypso_no_purchases_upgrade_nudge_impression"
								eventProperties={ commonEventProps }
							/>
							{ /* this.renderPurchasesByOtherAdminsNotice() to-do: render this as functional component */ }
							<EmptyContent
								title={ translate( 'Looking to upgrade?' ) }
								line={ translate(
									'Our plans give your site the power to thrive. ' +
										'Find the plan that works for you.'
								) }
								action={ translate( 'Upgrade now' ) }
								actionURL="/plans"
								illustration={ noSitesIllustration }
								actionCallback={ () => {
									recordTracksEvent( 'calypso_no_purchases_upgrade_nudge_click', commonEventProps );
								} }
							/>
						</>
					</CompactCard>
				</>
			);
		}

		return (
			<Main wideLayout className="purchases-list">
				<QueryUserPurchases />
				<QueryMembershipsSubscriptions />
				<PageViewTracker path="/me/purchases" title="Purchases" />

				<NavigationHeader
					navigationItems={ [] }
					title={ titles.sectionTitle }
					subtitle={ translate(
						'Manage your sites’ plans and upgrades. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="purchases" showIcon={ false } />,
							},
						}
					) }
				/>
				<PurchasesNavigation section="activeUpgrades" />
				{ content }
				<MembershipSubscriptions memberships={ subscriptions } />
				<QueryConciergeInitial />
			</Main>
		);
	}
}

export default connect( ( state: AppState ) => ( {
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	isFetchingUserPurchases: isFetchingUserPurchases( state ),
	purchases: getUserPurchases( state ),
	subscriptions: getAllSubscriptions( state ),
	sites: getSites( state ).filter( isValueTruthy ),
	nextAppointment: getConciergeNextAppointment( state ),
	isUserBlocked: getConciergeUserBlocked( state ),
	availableSessions: getAvailableConciergeSessions( state ),
	siteId: getSiteId( state, null ),
} ) )(
	withStoredPaymentMethods( localize( PurchasesListDataView ), { type: 'card', expired: true } )
);
