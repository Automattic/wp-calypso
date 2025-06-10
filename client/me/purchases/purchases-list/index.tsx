import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CompactCard } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import useGetJetpackTransferredLicensePurchases from '@automattic/data-stores/src/purchases/queries/use-get-jetpack-transferred-license-purchases';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
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
import { getPurchasesBySite, getSubscriptionsBySite } from 'calypso/lib/purchases';
import { MembershipSubscription, Purchase } from 'calypso/lib/purchases/types';
import { PurchaseListConciergeBanner } from 'calypso/me/purchases/purchases-list/purchase-list-concierge-banner';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import titles from 'calypso/me/purchases/titles';
import {
	WithStoredPaymentMethodsProps,
	withStoredPaymentMethods,
} from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
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
import { PurchasesByOtherAdminsNotice } from './purchases-by-other-admins-notice';
import PurchasesListHeader from './purchases-list-header';

export interface PurchasesListProps {
	noticeType?: string | undefined;
}

export interface PurchasesListConnectedProps {
	hasLoadedUserPurchasesFromServer: boolean;
	isFetchingUserPurchases: boolean;
	purchases: Purchase[];
	subscriptions: MembershipSubscription[];
	sites: SiteDetails[];
	nextAppointment: NextAppointment | null;
	isUserBlocked: boolean;
	availableSessions: number[];
	siteId: number | null;
	userId: number | undefined;
}

const PurchasesList: React.FC<
	PurchasesListProps & PurchasesListConnectedProps & WithStoredPaymentMethodsProps
> = ( {
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
	purchases,
	subscriptions,
	sites,
	nextAppointment,
	isUserBlocked,
	availableSessions,
	userId,
	paymentMethodsState,
} ) => {
	const translate = useTranslate();
	const {
		data: transferredOwnershipPurchases = [],
		isLoading,
		isSuccess: hasLoadedTransferredOwnershipPurchases,
	} = useGetJetpackTransferredLicensePurchases( { userId } );

	const isDataLoading = useCallback( () => {
		if (
			( isFetchingUserPurchases && ! hasLoadedUserPurchasesFromServer ) ||
			( isLoading && ! hasLoadedTransferredOwnershipPurchases )
		) {
			return true;
		}

		return ! sites.length && ! subscriptions.length;
	}, [
		hasLoadedUserPurchasesFromServer,
		isFetchingUserPurchases,
		isLoading,
		hasLoadedTransferredOwnershipPurchases,
		sites.length,
		subscriptions.length,
	] );

	const allPurchasesLoaded =
		hasLoadedUserPurchasesFromServer && hasLoadedTransferredOwnershipPurchases;

	const allPurchases = useMemo( () => {
		if ( allPurchasesLoaded ) {
			return [ ...purchases, ...transferredOwnershipPurchases ];
		}
		return [];
	}, [ allPurchasesLoaded, purchases, transferredOwnershipPurchases ] );

	const renderConciergeBanner = () => {
		return (
			<PurchaseListConciergeBanner
				nextAppointment={ nextAppointment ?? undefined }
				availableSessions={ availableSessions }
				isUserBlocked={ isUserBlocked }
			/>
		);
	};

	const renderMembershipSubscriptions = () => {
		if ( ! subscriptions.length || ! allPurchasesLoaded ) {
			return null;
		}

		return getSubscriptionsBySite( subscriptions ).map( ( site ) => (
			<MembershipSite site={ site } key={ site.id } />
		) );
	};

	const commonEventProps = { context: 'me' };
	let content;

	if ( isDataLoading() ) {
		content = <PurchasesSite isPlaceholder />;
	}

	if ( allPurchases && allPurchasesLoaded && allPurchases.length ) {
		content = (
			<>
				{ renderConciergeBanner() }

				<PurchasesListHeader showSite />

				{ getPurchasesBySite( allPurchases, sites, userId ).map( ( site ) => {
					return (
						<PurchasesSite
							key={ site.id }
							siteId={ site.id }
							slug={ site.slug }
							purchases={ site.purchases }
							showSite
							cards={ paymentMethodsState.paymentMethods }
							transferredOwnershipPurchases={ transferredOwnershipPurchases }
						/>
					);
				} ) }
			</>
		);
	}

	if (
		purchases &&
		! purchases.length &&
		! subscriptions.length &&
		transferredOwnershipPurchases &&
		! transferredOwnershipPurchases.length
	) {
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
				{ renderConciergeBanner() }
				<CompactCard className="purchases-list__no-content">
					<>
						<TrackComponentView
							eventName="calypso_no_purchases_upgrade_nudge_impression"
							eventProperties={ commonEventProps }
						/>
						<PurchasesByOtherAdminsNotice sites={ sites } />
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
					'View, manage, or cancel your plan and other purchases. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="purchases" showIcon={ false } />,
						},
					}
				) }
			/>
			<PurchasesNavigation section="activeUpgrades" />
			{ content }
			{ renderMembershipSubscriptions() }
			<QueryConciergeInitial />
		</Main>
	);
};

export default connect( ( state: AppState ) => ( {
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	isFetchingUserPurchases: isFetchingUserPurchases( state ),
	purchases: getUserPurchases( state ) ?? [],
	subscriptions: getAllSubscriptions( state ),
	sites: getSites( state ).filter( isValueTruthy ),
	nextAppointment: getConciergeNextAppointment( state ),
	isUserBlocked: getConciergeUserBlocked( state ),
	availableSessions: getAvailableConciergeSessions( state ),
	siteId: getSiteId( state, null ),
	userId: getCurrentUserId( state ) ?? undefined,
} ) )( withStoredPaymentMethods( PurchasesList, { type: 'card', expired: true } ) );
