import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-rna-action-card';
import Notice from 'calypso/components/notice';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { PurchasesDataViews } from 'calypso/me/purchases/purchases-list-in-dataviews/purchases-data-view';
import PurchasesSite from 'calypso/me/purchases/purchases-site';
import { useSelector } from 'calypso/state';
import { hasJetpackPartnerAccess as hasJetpackPartnerAccessSelector } from 'calypso/state/partner-portal/partner/selectors';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';

import './style.scss';

export default function SubscriptionsContentWrapper() {
	const translate = useTranslate();
	const isFetchingPurchases = useSelector( isFetchingSitePurchases );
	const hasLoadedPurchases = useSelector( hasLoadedSitePurchasesFromServer );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSite = useSelector( getSelectedSite );
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSiteId ) );
	const sites = useSelector( getSites ).filter( isValueTruthy );
	const getManagePurchaseUrlFor: GetManagePurchaseUrlFor = useCallback(
		( siteSlug, purchaseId ) => `/purchases/subscriptions/${ siteSlug }/${ purchaseId }`,
		[]
	);

	// Read ?removed and ?removedDomain from URL on mount, then strip params.
	const [ removedNoticeData ] = useState( () => {
		if ( typeof window === 'undefined' ) {
			return null;
		}
		const params = new URLSearchParams( window.location.search );
		const removed = params.get( 'removed' );
		if ( ! removed ) {
			return null;
		}
		const removedDomain = params.get( 'removedDomain' );
		params.delete( 'removed' );
		params.delete( 'removedDomain' );
		const newSearch = params.toString();
		const newUrl =
			window.location.pathname + ( newSearch ? '?' + newSearch : '' ) + window.location.hash;
		window.history.replaceState( window.history.state, '', newUrl );
		return { productNoun: removed, atomicDomain: removedDomain };
	} );
	const [ showRemovedNotice, setShowRemovedNotice ] = useState( Boolean( removedNoticeData ) );

	if ( ! selectedSiteId ) {
		return <NoSitesMessage />;
	}
	if ( ! hasLoadedPurchases || isFetchingPurchases ) {
		return (
			<div className="subscriptions__list">
				<PurchasesSite isPlaceholder />
			</div>
		);
	}
	// If there is a selected site but no site data, show the placeholder
	if ( ! selectedSite?.ID ) {
		return (
			<div className="subscriptions__list">
				<PurchasesSite isPlaceholder />
			</div>
		);
	}
	if ( purchases.length < 1 ) {
		return <NoPurchasesMessage />;
	}

	const removedNotice =
		config.isEnabled( 'purchases/split-cancel-remove' ) &&
		showRemovedNotice &&
		removedNoticeData ? (
			<Notice
				showDismiss
				onDismissClick={ () => setShowRemovedNotice( false ) }
				status="is-success"
			>
				{ removedNoticeData.atomicDomain
					? translate(
							'Your %(productNoun)s has been removed. Your site will revert to its previous state \u2014 {{a}}download a backup{{/a}} to save your content, themes, and plugins. You\u2019ll receive a confirmation email shortly.',
							{
								args: { productNoun: removedNoticeData.productNoun },
								components: {
									a: (
										<a
											href={ `https://${ removedNoticeData.atomicDomain }/wp-admin/export.php` }
											target="_blank"
											rel="noreferrer"
										/>
									),
								},
							}
					  )
					: translate(
							'Your %(productNoun)s has been removed. You\u2019ll receive a confirmation email shortly.',
							{
								args: { productNoun: removedNoticeData.productNoun },
							}
					  ) }
			</Notice>
		) : null;

	return (
		<>
			{ removedNotice }
			<PurchasesDataViews
				purchases={ purchases }
				sites={ sites }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
			/>
		</>
	);
}

function NoPurchasesMessage() {
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();
	const hasJetpackPartnerAccess = useSelector( hasJetpackPartnerAccessSelector );
	const commonEventProps = { context: 'site' };

	let url;
	if ( ! isJetpackCloud() ) {
		url = selectedSite ? `/plans/${ selectedSite.slug }` : '/plans';
	} else if ( hasJetpackPartnerAccess ) {
		url = selectedSiteId
			? `/partner-portal/issue-license?site_id=${ selectedSiteId }`
			: '/partner-portal/issue-license';
	} else {
		url = selectedSite ? `/pricing/${ selectedSite.slug }` : '/pricing';
	}

	return isJetpackCloud() ? (
		<JetpackRnaActionCard
			headerText={ translate( 'You don’t have any active subscriptions for this site.' ) }
			subHeaderText={ translate(
				'Check out how Jetpack’s security, performance, and growth tools can improve your site.'
			) }
			ctaButtonLabel={ translate( 'View products' ) }
			ctaButtonURL={ url }
		/>
	) : (
		<CompactCard className="subscriptions__list">
			<>
				<TrackComponentView
					eventName="calypso_no_purchases_upgrade_nudge_impression"
					eventProperties={ commonEventProps }
				/>
				<EmptyContent
					title={ translate( 'Looking to upgrade?' ) }
					line={ translate( 'You have made no purchases for this site.' ) }
					action={ translate( 'Upgrade now' ) }
					actionURL={ url }
					actionCallback={ () => {
						recordTracksEvent( 'calypso_no_purchases_upgrade_nudge_click', commonEventProps );
					} }
				/>
			</>
		</CompactCard>
	);
}
