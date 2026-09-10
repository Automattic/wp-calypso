import config from '@automattic/calypso-config';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { localizeUrl } from '@automattic/i18n-utils';
import { CALYPSO_CONTACT, JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useNoticeRecordQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import usePremiumAnalyticsStatusMutation from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation';
import {
	PREMIUM_ANALYTICS_ENABLED_SETTING,
	premiumAnalyticsStatusQueryKey,
} from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import { trackPremiumAnalyticsPreviewEvent } from '../premium-analytics-preview/track-event';
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
	// Read through a ref by the impression effect, so a record refreshed mid-mount does not
	// count as a second showing.
	const postponedCountRef = useRef( postponedCount );
	postponedCountRef.current = postponedCount;
	const trackEvent = ( name: string, properties: Record< string, unknown > = {} ) =>
		trackPremiumAnalyticsPreviewEvent( 'notice', name, siteId, properties );
	// Scoped to the site rather than held as a flag: the notices host reuses this component across
	// site switches in Calypso, so a plain boolean would carry one site's dismissal to the next.
	const [ dismissedSiteId, setDismissedSiteId ] = useState< number | null >( null );
	const [ failedSiteId, setFailedSiteId ] = useState< number | null >( null );
	const [ enabledSiteId, setEnabledSiteId ] = useState< number | null >( null );

	const noticeDismissed = dismissedSiteId === siteId;
	const enableFailed = failedSiteId === siteId;
	const isSwitchedOn = enabledSiteId === siteId;

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

	const { mutateAsync: recordDismissalAsync } = useNoticeVisibilityMutation(
		siteId,
		'premium_analytics_preview'
	);

	const dismissNotice = () => {
		trackEvent( 'dismissed', { postponed_count: postponedCount } );
		setDismissedSiteId( siteId );

		// Best-effort past the mutation's own retry: local state already hides it for this session,
		// and a lost write only re-offers the same step on the next load, so nothing is surfaced.
		recordDismissalAsync(
			postponedCount === 0
				? { status: 'postponed', postponedFor: DISMISSAL_POSTPONEMENT }
				: { status: 'dismissed' }
		).catch( () => {} );
	};

	// Neither the confirmation nor a failed attempt is a rejection, so closing those records
	// nothing - the site is asked again on the next load.
	const hideNotice = () => setDismissedSiteId( siteId );

	const enablePremiumAnalyticsPreview = async () => {
		trackEvent( 'enable_button_clicked' );
		setFailedSiteId( null );

		try {
			const enabled = await enablePreviewAsync( true );
			shouldRestoreFocus.current = true;

			if ( ! enabled ) {
				trackEvent( 'enable_failed', { reason: 'not_enabled' } );
				setFailedSiteId( siteId );
				return;
			}

			trackEvent( 'enabled' );

			// Hand over a link rather than navigating for them: the dashboard only exists on a
			// fresh page load, and being thrown out of the page you were reading is a poor reward
			// for saying yes.
			//
			// Deliberately no dismissal here. An enabled site already fails the eligibility rule, so
			// the invitation is gone on the next load either way — and recording one marks the
			// notice hidden, which unmounts this notice mid-sentence, taking the link with it.
			setEnabledSiteId( siteId );
		} catch {
			shouldRestoreFocus.current = true;
			trackEvent( 'enable_failed', { reason: 'request_failed' } );
			setFailedSiteId( siteId );
		}
	};

	// The confirmation lives on local state, so a round trip through another Stats page would
	// remount this component and invite the site again while the cached status still reads false.
	// Recorded as the notice goes away rather than on success, which would pull the confirmation
	// off the screen before it could be read.
	useEffect( () => {
		if ( ! isSwitchedOn ) {
			return;
		}
		return () => {
			queryClient.setQueryData( premiumAnalyticsStatusQueryKey( siteId ), {
				[ PREMIUM_ANALYTICS_ENABLED_SETTING ]: true,
			} );
		};
	}, [ isSwitchedOn, queryClient, siteId ] );

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

	if ( isSwitchedOn ) {
		return (
			<NoticeContainer isOdyssey={ isOdyssey }>
				<NoticeBanner
					level="success"
					title={ translate( 'The new Traffic tab is on' ) }
					onClose={ hideNotice }
				>
					<p key="desc" role="status">
						{ translate(
							'You’ll find it in the menu alongside your current Stats. You can switch it off again from the settings in the new Traffic tab.'
						) }
					</p>
					<p key="cta">
						<Button
							variant="primary"
							href={ premiumAnalyticsDashboardUrl ?? undefined }
							ref={ restoreFocus }
						>
							{ translate( 'Go to the new Traffic tab' ) }
						</Button>
					</p>
				</NoticeBanner>
			</NoticeContainer>
		);
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
				hideCloseButton={ isEnabling }
				onClose={ dismissNotice }
			>
				<p key="desc">
					{ translate(
						'Clearer charts, and widgets you can move and resize to suit how you read your site. It’s an early version, and you can switch it off again at any time.'
					) }
				</p>
				<p key="cta">
					<Button
						variant="primary"
						onClick={ enablePremiumAnalyticsPreview }
						isBusy={ isEnabling }
						disabled={ isEnabling }
						// Keyboard focus survives the button going busy, so the next Tab carries on
						// from here rather than from the top of the page.
						accessibleWhenDisabled
					>
						{ isEnabling ? translate( 'Switching it on…' ) : translate( 'Switch it on' ) }
					</Button>
				</p>
			</NoticeBanner>
		</NoticeContainer>
	);
};

export default PremiumAnalyticsPreviewNotice;
