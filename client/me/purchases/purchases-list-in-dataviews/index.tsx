import {
	userPurchasesQuery,
	userTransferredPurchasesQuery,
	userPaymentMethodsQuery,
	monetizeSubscriptionsQuery,
	allSitesQuery,
} from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CompactCard } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import noSitesIllustration from 'calypso/assets/images/illustrations/illustration-nosites.svg';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import EmptyContent from 'calypso/components/empty-content';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { type GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';
import { PurchaseListConciergeBanner } from 'calypso/me/purchases/purchases-list/purchase-list-concierge-banner';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import titles from 'calypso/me/purchases/titles';
import { useSelector } from 'calypso/state';
import getAvailableConciergeSessions from 'calypso/state/selectors/get-available-concierge-sessions';
import getConciergeNextAppointment, {
	NextAppointment,
} from 'calypso/state/selectors/get-concierge-next-appointment';
import getConciergeUserBlocked from 'calypso/state/selectors/get-concierge-user-blocked';
import { PurchasesByOtherAdminsNotice } from '../purchases-list/purchases-by-other-admins-notice';
import PurchasesSite from '../purchases-site';
import { CalypsoAuthProvider } from './calypso-auth-provider';
import { PurchasesDataViews, MembershipsDataViews } from './purchases-data-view';
import type { Purchase, Site, StoredPaymentMethod } from '@automattic/api-core';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

export interface PurchasesListProps {
	noticeType?: string | undefined;
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
}

const PurchasesListDataView: React.FC< PurchasesListProps > = ( { getManagePurchaseUrlFor } ) => {
	const translate = useTranslate();
	const nextAppointment = useSelector( getConciergeNextAppointment );
	const isUserBlocked = useSelector( getConciergeUserBlocked );
	const availableSessions = useSelector( getAvailableConciergeSessions );

	const { data: purchases = [], isLoading: isLoadingPurchases } = useQuery( userPurchasesQuery() );
	const { data: transferredPurchases = [], isLoading: isLoadingTransferred } = useQuery(
		userTransferredPurchasesQuery()
	);
	const { data: paymentMethods = [] } = useQuery(
		userPaymentMethodsQuery( { type: 'card', expired: true } )
	);
	const { data: monetizeSubscriptions = [] } = useQuery( monetizeSubscriptionsQuery() );
	const { data: sites = [] } = useQuery( allSitesQuery() );

	const isDataLoading = isLoadingPurchases || isLoadingTransferred;

	const allPurchases = useMemo(
		() => ( isDataLoading ? [] : [ ...purchases, ...transferredPurchases ] ),
		[ isDataLoading, purchases, transferredPurchases ]
	);

	return (
		<CalypsoAuthProvider>
			<Main wideLayout className="purchases-list">
				<QueryConciergeInitial />
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
					isDataLoading={ isDataLoading }
					allPurchases={ allPurchases }
					transferredPurchases={ transferredPurchases }
					paymentMethods={ paymentMethods }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					sites={ sites }
					nextAppointment={ nextAppointment }
					isUserBlocked={ isUserBlocked }
					availableSessions={ availableSessions }
				/>
				{ monetizeSubscriptions.length > 0 && (
					<MembershipsDataViews memberships={ monetizeSubscriptions } />
				) }
			</Main>
		</CalypsoAuthProvider>
	);
};

function PurchasesContent( {
	isDataLoading,
	allPurchases,
	transferredPurchases,
	paymentMethods,
	getManagePurchaseUrlFor,
	sites,
	nextAppointment,
	isUserBlocked,
	availableSessions,
}: {
	isDataLoading: boolean;
	allPurchases: Purchase[];
	transferredPurchases: Purchase[];
	paymentMethods: StoredPaymentMethod[];
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
	sites: Site[];
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
	// monetize subscriptions are rendered separately in the parent
	// component.
	if ( allPurchases.length ) {
		return (
			<PurchasesDataViews
				purchases={ allPurchases }
				sites={ sites }
				transferredOwnershipPurchases={ transferredPurchases }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				paymentMethods={ paymentMethods }
			/>
		);
	}

	// If the user has no regular subscriptions, but does have monetize
	// subscriptions, render nothing. The monetize subscriptions will be
	// rendered separately in the parent component.
	if ( ! sites.length ) {
		return <NoSitesMessage />;
	}

	// If the user has no regular subscriptions but does have sites, render the upsell page.
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
					<PurchasesByOtherAdminsNotice sites={ sites as unknown as SiteDetails[] } />
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

export default PurchasesListDataView;
