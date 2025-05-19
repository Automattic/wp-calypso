import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CompactCard } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { LocalizeProps, localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import EmptyContent from 'calypso/components/empty-content';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
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
import PurchasesListHeader from './purchases-list-header';

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

class PurchasesList extends Component<
	PurchasesListProps & PurchasesListConnectedProps & WithStoredPaymentMethodsProps & LocalizeProps
> {
	isDataLoading() {
		if ( this.props.isFetchingUserPurchases && ! this.props.hasLoadedUserPurchasesFromServer ) {
			return true;
		}

		return ! this.props.sites.length && ! this.props.subscriptions.length;
	}

	renderPurchasesByOtherAdminsNotice() {
		const { sites, translate } = this.props;

		/*
		 * Because this is only rendered when the user has no purchases,
		 * we don't need to check each site to ensure the purchases aren't
		 * linked with the user (they can't be, since they don't have any).
		 */
		const affectedSites = sites
			.filter( ( site ) => {
				if ( ! site?.plan?.is_free ) {
					return site.capabilities.manage_options;
				}
				if ( site?.products && site?.products?.length > 0 ) {
					return site.capabilities.manage_options;
				}
				return false;
			} )
			.map( ( site ) => site.slug );

		if ( ! affectedSites.length ) {
			return;
		}

		let affectedSitesString = '';

		if ( affectedSites.length === 1 ) {
			affectedSitesString = affectedSites[ 0 ];
		} else {
			const allButLast = affectedSites.slice( 0, -1 ).join( ', ' );
			const translatedAnd = translate( 'and', {
				comment: 'last conjunction in a list of blognames: (blog1, blog2,) blog3 _and_ blog4',
			} );
			const last = affectedSites[ affectedSites.length - 1 ];

			affectedSitesString = allButLast + ' ' + translatedAnd + ' ' + last;
		}

		return (
			<Notice status="is-info" showDismiss={ false }>
				{ translate(
					'The upgrades for {{strong}}%(affectedSitesString)s{{/strong}} are owned by another site administrator. ' +
						'These can only be managed by the purchase owners.',
					{
						components: { strong: <strong /> },
						args: {
							affectedSitesString,
						},
					}
				) }
			</Notice>
		);
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
		const commonEventProps = { context: 'me' };
		let content;

		if ( this.isDataLoading() ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( purchases && purchases.length ) {
			content = (
				<>
					{ this.renderConciergeBanner() }

					<PurchasesListHeader showSite />

					{ getPurchasesBySite( purchases, sites ).map( ( site ) => (
						<PurchasesSite
							key={ site.id }
							siteId={ site.id }
							slug={ site.slug }
							purchases={ site.purchases }
							showSite
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
							{ this.renderPurchasesByOtherAdminsNotice() }
							<EmptyContent
								title={ translate( 'Looking to upgrade?' ) }
								line={ translate(
									'Our plans give your site the power to thrive. ' +
										'Find the plan that works for you.'
								) }
								action={ translate( 'Upgrade now' ) }
								actionURL="/plans"
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
} ) )( withStoredPaymentMethods( localize( PurchasesList ), { type: 'card', expired: true } ) );
