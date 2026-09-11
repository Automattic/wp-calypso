import config from '@automattic/calypso-config';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { localizeUrl } from '@automattic/i18n-utils';
import { CALYPSO_CONTACT, JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import useNoticeVisibilityMutation, {
	NoticeUpdate,
} from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useNoticeRecordQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import usePremiumAnalyticsStatusMutation from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation';
import {
	PREMIUM_ANALYTICS_ENABLED_SETTING,
	premiumAnalyticsStatusQueryKey,
} from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import {
	NAVIGATION_DELAY,
	trackPremiumAnalyticsPreviewEvent,
} from '../premium-analytics-preview/track-event';
import { StatsNoticeProps } from './types';

const DAY_IN_SECONDS = 24 * 3600;
// The client owns the schedule: the server only counts postponements. The first dismissal holds
// the invitation back for this long and it returns once; the next one is for good.
const DISMISSAL_POSTPONEMENT = 30 * DAY_IN_SECONDS;

const NoticeContainer = ( {
	isOdyssey,
	children,
}: {
	isOdyssey: boolean;
	children: React.ReactNode;
} ) => (
	<div
		className={ `inner-notice-container ${ ! isOdyssey ? 'inner-notice-container--calypso' : '' }` }
	>
		{ children }
	</div>
);

const PremiumAnalyticsPreviewNotice = ( {
	siteId,
	isOdysseyStats,
	premiumAnalyticsDashboardUrl,
}: StatsNoticeProps ) => {
	const translate = useTranslate();
	const queryClient = useQueryClient();
	// Which build we are in, as opposed to the `isOdysseyStats` prop, which is
	// `is_running_in_jetpack_site` and false in a Simple site's wp-admin. That prop still decides
	// where support lives, because it says which API the site answers on.
	const isOdyssey = config.isEnabled( 'is_odyssey' );
	const { data: noticeRecord } = useNoticeRecordQuery( siteId, 'premium_analytics_preview' );
	const postponedCount = noticeRecord?.postponed_count ?? 0;
	// Read through a ref so the impression effect does not depend on the count: a record refreshed
	// while mounted is not a second showing.
	const postponedCountRef = useRef( postponedCount );
	postponedCountRef.current = postponedCount;
	const trackEvent = ( name: string, properties: Record< string, unknown > = {} ) =>
		trackPremiumAnalyticsPreviewEvent( 'notice', name, siteId, properties );
	// Scoped to the site rather than held as a flag: the notices host reuses this component across
	// site switches in Calypso, so a plain boolean would carry one site's dismissal to the next.
	const [ dismissedSiteId, setDismissedSiteId ] = useState< number | null >( null );
	const [ failedSiteId, setFailedSiteId ] = useState< number | null >( null );
	// Stays busy until the page unloads: the write has succeeded and the reader is on their way.
	const [ leavingSiteId, setLeavingSiteId ] = useState< number | null >( null );

	const noticeDismissed = dismissedSiteId === siteId;
	const enableFailed = failedSiteId === siteId;
	const isLeaving = leavingSiteId === siteId;

	// Activating the button removes it, so focus would otherwise fall back to the document and the
	// next Tab would start again from the top of the page.
	const shouldRestoreFocus = useRef( false );
	const restoreFocus = useCallback( ( node: HTMLElement | null ) => {
		if ( node && shouldRestoreFocus.current ) {
			shouldRestoreFocus.current = false;
			node.focus();
		}
	}, [] );

	const { mutateAsync: enablePreviewAsync, isPending: isEnabling } =
		usePremiumAnalyticsStatusMutation( siteId );
	const isBusy = isEnabling || isLeaving;

	const { mutateAsync: recordDismissalAsync } = useNoticeVisibilityMutation(
		siteId,
		'premium_analytics_preview'
	);

	const dismissNotice = () => {
		trackEvent( 'dismissed', { postponed_count: postponedCount } );
		setDismissedSiteId( siteId );

		const update: NoticeUpdate =
			postponedCount === 0
				? { status: 'postponed', postponedFor: DISMISSAL_POSTPONEMENT }
				: { status: 'dismissed' };
		// Best-effort past the mutation's own retry: local state already hides it for this session,
		// and a lost write only re-offers the same step on the next load. The event is what tells a
		// site that keeps failing apart from one that never got past its first sighting.
		recordDismissalAsync( update ).catch( () =>
			trackEvent( 'dismiss_failed', { postponed_count: postponedCount, status: update.status } )
		);
	};

	// Neither the confirmation nor a failed attempt is a rejection, so closing those records
	// nothing - the site is asked again on the next load.
	const hideNotice = () => setDismissedSiteId( siteId );

	const enablePremiumAnalyticsPreview = async () => {
		trackEvent( 'enable_button_clicked' );
		setFailedSiteId( null );

		try {
			const enabled = await enablePreviewAsync( true );

			if ( ! enabled ) {
				shouldRestoreFocus.current = true;
				trackEvent( 'enable_failed', { reason: 'not_enabled' } );
				setFailedSiteId( siteId );
				return;
			}
		} catch {
			shouldRestoreFocus.current = true;
			trackEvent( 'enable_failed', { reason: 'request_failed' } );
			setFailedSiteId( siteId );
			return;
		}

		// After the write so a retry counts once, before the navigation so it is not cut short.
		trackEvent( 'enabled' );
		// Straight there rather than a link: left on this page, a reader can miss that there is a
		// second step and take the old Traffic page for the new one. The dashboard only exists on
		// a fresh page load, so this is a navigation, not a route change.
		//
		// Deliberately no dismissal here. An enabled site already fails the eligibility rule, so
		// the invitation is gone on the next load either way.
		setLeavingSiteId( siteId );
		// The cohort rule requires the URL before this notice can win its slot, so it is never
		// null here; the shared notice props are just looser than that gate.
		setTimeout( () => {
			window.location.href = premiumAnalyticsDashboardUrl!;
		}, NAVIGATION_DELAY );
	};

	// The browser's Back button can restore this page from the back/forward cache with the button
	// still locked in its leaving state. The site is on by then, so the cache says so and the
	// notices host takes the invitation down rather than offering it again.
	useEffect( () => {
		if ( ! isLeaving ) {
			return;
		}
		const settleOnRestore = ( event: PageTransitionEvent ) => {
			if ( ! event.persisted ) {
				return;
			}
			setLeavingSiteId( null );
			queryClient.setQueryData( premiumAnalyticsStatusQueryKey( siteId ), {
				[ PREMIUM_ANALYTICS_ENABLED_SETTING ]: true,
			} );
		};
		window.addEventListener( 'pageshow', settleOnRestore );
		return () => window.removeEventListener( 'pageshow', settleOnRestore );
	}, [ isLeaving, queryClient, siteId ] );

	useEffect( () => {
		if ( ! noticeDismissed ) {
			trackPremiumAnalyticsPreviewEvent( 'notice', 'viewed', siteId, {
				postponed_count: postponedCountRef.current,
			} );
		}
	}, [ noticeDismissed, siteId ] );

	if ( noticeDismissed ) {
		return null;
	}

	if ( enableFailed ) {
		return (
			<NoticeContainer isOdyssey={ isOdyssey }>
				<NoticeBanner
					level="error"
					title={ translate( 'We couldn’t switch on the new Traffic tab' ) }
					onClose={ hideNotice }
				>
					<p key="desc" role="alert">
						{ translate(
							'Something went wrong on our end. Please try again — if it keeps happening, get in touch with support.'
						) }
					</p>
					<p key="cta">
						<Button
							variant="primary"
							onClick={ enablePremiumAnalyticsPreview }
							ref={ restoreFocus }
						>
							{ translate( 'Try again' ) }
						</Button>
						<a
							className="notice-banner__action-link"
							href={ isOdysseyStats ? localizeUrl( JETPACK_CONTACT_SUPPORT ) : CALYPSO_CONTACT }
							target="_blank"
							rel="noreferrer"
						>
							{ translate( 'Contact support' ) }
							<Icon className="stats-icon" icon={ external } size={ 24 } />
						</a>
					</p>
				</NoticeBanner>
			</NoticeContainer>
		);
	}

	return (
		<NoticeContainer isOdyssey={ isOdyssey }>
			<NoticeBanner
				level="info"
				title={ translate( 'Try the new Traffic tab' ) }
				// Nothing to dismiss halfway through a write that is about to change the answer.
				hideCloseButton={ isBusy }
				onClose={ dismissNotice }
			>
				<p key="desc">
					{ translate(
						'Clearer charts, and widgets you can move and resize to suit how you read your site. It’s an early version, and you can switch it off again at any time.'
					) }
				</p>
				<p key="next">
					{ translate(
						'We’ll take you there once it’s on. Your current Stats stay where they are.'
					) }
				</p>
				<p key="cta">
					<Button
						variant="primary"
						onClick={ enablePremiumAnalyticsPreview }
						isBusy={ isBusy }
						disabled={ isBusy }
						// Keyboard focus survives the button going busy, so the next Tab carries on
						// from here rather than from the top of the page.
						accessibleWhenDisabled
					>
						{ isBusy ? translate( 'Switching it on…' ) : translate( 'Switch it on' ) }
					</Button>
				</p>
			</NoticeBanner>
		</NoticeContainer>
	);
};

export default PremiumAnalyticsPreviewNotice;
