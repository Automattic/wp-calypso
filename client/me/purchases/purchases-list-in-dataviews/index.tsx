import { SiteDetails } from '@automattic/data-stores';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { LocalizeProps, localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSubscriptionsBySite } from 'calypso/lib/purchases';
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
import MembershipSite from '../membership-site';
import PurchasesSite from '../purchases-site';
import { PurchasesDataViews } from './purchases-data-view';
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

class PurchasesListDataView extends Component<
	PurchasesListProps & PurchasesListConnectedProps & WithStoredPaymentMethodsProps & LocalizeProps
> {
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
				nextAppointment={ nextAppointment ?? undefined }
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
			content = <PurchasesDataViews purchases={ purchases } translate={ translate } />;
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
				{ this.renderMembershipSubscriptions() }
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
