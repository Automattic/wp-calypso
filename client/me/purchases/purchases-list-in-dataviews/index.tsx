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
import {
	type GetManagePurchaseUrlFor,
	MembershipSubscription,
	Purchase,
} from 'calypso/lib/purchases/types';
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
import { PurchasesByOtherAdminsNotice } from '../purchases-list/purchases-by-other-admins-notice';
import PurchasesSite from '../purchases-site';
import { PurchasesDataViews, MembershipsDataViews } from './purchases-data-view';
import './style.scss';

export interface PurchasesListProps {
	noticeType?: string | undefined;
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
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
	userId?: number | null;
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

const PurchasesListDataView: React.FC<
	PurchasesListProps & PurchasesListConnectedProps & WithStoredPaymentMethodsProps
> = ( {
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
	getManagePurchaseUrlFor,
	purchases,
	subscriptions,
	sites,
	nextAppointment,
	isUserBlocked,
	availableSessions,
	userId,
} ) => {
	const translate = useTranslate();
	const {
		data: transferredOwnershipPurchases = [],
		isLoading,
		isSuccess: hasLoadedTransferredOwnershipPurchases,
	} = useGetJetpackTransferredLicensePurchases( { userId: userId || undefined } );

	const isDataLoading = useCallback( () => {
		if (
			( isFetchingUserPurchases && ! hasLoadedUserPurchasesFromServer ) ||
			( isLoading && ! hasLoadedTransferredOwnershipPurchases )
		) {
			return true;
		}

		return false;
	}, [
		hasLoadedUserPurchasesFromServer,
		isFetchingUserPurchases,
		isLoading,
		hasLoadedTransferredOwnershipPurchases,
	] );

	const allPurchasesLoaded =
		hasLoadedUserPurchasesFromServer && hasLoadedTransferredOwnershipPurchases;

	const allPurchases = useMemo( () => {
		if ( allPurchasesLoaded ) {
			return [ ...( purchases || [] ), ...transferredOwnershipPurchases ];
		}
		return [];
	}, [ allPurchasesLoaded, purchases, transferredOwnershipPurchases ] );

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
			<PurchasesContent
				isDataLoading={ isDataLoading() }
				allPurchases={ allPurchases }
				transferredOwnershipPurchases={ transferredOwnershipPurchases }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				subscriptions={ subscriptions }
				sites={ sites }
				nextAppointment={ nextAppointment }
				isUserBlocked={ isUserBlocked }
				availableSessions={ availableSessions }
			/>
			<MembershipSubscriptions memberships={ subscriptions } />
			<QueryConciergeInitial />
		</Main>
	);
};

function PurchasesContent( {
	isDataLoading,
	allPurchases,
	transferredOwnershipPurchases,
	getManagePurchaseUrlFor,
	subscriptions,
	sites,
	nextAppointment,
	isUserBlocked,
	availableSessions,
}: {
	isDataLoading: boolean;
	allPurchases: Purchase[];
	transferredOwnershipPurchases: Purchase[];
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
	subscriptions: MembershipSubscription[];
	sites: SiteDetails[];
	nextAppointment: NextAppointment | null;
	isUserBlocked: boolean;
	availableSessions: number[];
} ) {
	const translate = useTranslate();

	// If the data is loading, render the loading indicator.
	if ( isDataLoading ) {
		return <PurchasesSite isPlaceholder />;
	}

	// If the user has regular subscriptions, render them. Note that
	// memberships subscriptions are rendered separately in the parent
	// component.
	if ( allPurchases.length ) {
		return (
			<PurchasesDataViews
				purchases={ allPurchases }
				sites={ sites }
				transferredOwnershipPurchases={ transferredOwnershipPurchases }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
			/>
		);
	}

	// If the user has no regular subscriptions, but does have memberships
	// subscriptions, render nothing. The memberships subscriptions will be
	// rendered separately in the parent component.
	if ( subscriptions.length ) {
		return null;
	}

	// If the user has no regular subscriptions, no memberships subscriptions,
	// and no sites, render the "no sites" page.
	if ( ! sites.length ) {
		return <NoSitesMessage />;
	}

	// If the user has no regular subscriptions, no memberships subscriptions,
	// but does have sites, render the upsell page.
	const commonEventProps = { context: 'me' };
	return (
		<>
			<PurchaseListConciergeBanner
				nextAppointment={ nextAppointment ?? undefined }
				availableSessions={ availableSessions }
				isUserBlocked={ isUserBlocked }
			/>
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
							'Our plans give your site the power to thrive. ' + 'Find the plan that works for you.'
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
	userId: getCurrentUserId( state ),
} ) )( withStoredPaymentMethods( PurchasesListDataView, { type: 'card', expired: true } ) );
