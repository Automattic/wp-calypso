import { recordTracksEvent } from '@automattic/calypso-analytics';
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
import usePremiumAnalyticsStatusMutation from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation';
import {
	PREMIUM_ANALYTICS_ENABLED_SETTING,
	premiumAnalyticsStatusQueryKey,
} from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import { StatsNoticeProps } from './types';

export const PREMIUM_ANALYTICS_PAGE_PATH = 'admin.php?page=jetpack-premium-analytics-wp-admin';

const DAY_IN_SECONDS = 24 * 3600;
const FIRST_DISMISSAL_POSTPONEMENT = 30 * DAY_IN_SECONDS;

const dismissalCountKey = ( siteId: number | null ) =>
	`jetpack_stats_premium_analytics_preview_dismissals_${ siteId }`;

/**
 * How many times this browser has been shown the door on this site.
 *
 * The invitation returns once after the first dismissal and never after the second. The notices
 * endpoint reports current visibility rather than a history, so the count is kept locally: a
 * cleared browser store costs at most one extra invitation. A blocked one costs more - there is
 * nowhere to keep the count, so the invitation returns every month; only the endpoint could fix
 * that, by escalating a repeat postponement itself.
 * @param siteId Site the dismissal belongs to.
 */
const readDismissalCount = ( siteId: number | null ) => {
	try {
		return Number( localStorage.getItem( dismissalCountKey( siteId ) ) ) || 0;
	} catch {
		return 0;
	}
};

const writeDismissalCount = ( siteId: number | null, count: number ) => {
	try {
		localStorage.setItem( dismissalCountKey( siteId ), String( count ) );
	} catch {
		// Storage can be unavailable or full; the postponement recorded on the site still stands.
	}
};

const trackEvent = (
	isOdyssey: boolean,
	name: string,
	siteId: number | null,
	properties: Record< string, unknown > = {}
) => {
	const prefix = isOdyssey ? 'jetpack_odyssey' : 'calypso';
	recordTracksEvent( `${ prefix }_stats_premium_analytics_preview_notice_${ name }`, {
		blog_id: siteId,
		...properties,
	} );
};

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

	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'premium_analytics_preview',
		'postponed',
		FIRST_DISMISSAL_POSTPONEMENT
	);
	const { mutateAsync: dismissNoticeForGoodAsync } = useNoticeVisibilityMutation(
		siteId,
		'premium_analytics_preview',
		'dismissed'
	);

	const dismissNotice = () => {
		const dismissalCount = readDismissalCount( siteId ) + 1;
		const isFinalDismissal = dismissalCount > 1;

		trackEvent( isOdyssey, 'dismissed', siteId, { dismissal_count: dismissalCount } );
		setDismissedSiteId( siteId );

		// Best-effort: the local state above already hides the notice for this session. Counted only
		// once the site has recorded it, so a lost write doesn't spend a dismissal the customer
		// never got the benefit of.
		const record = isFinalDismissal ? dismissNoticeForGoodAsync : postponeNoticeAsync;
		record()
			.then( () => writeDismissalCount( siteId, dismissalCount ) )
			.catch( () => {} );
	};

	// Neither the confirmation nor a failed attempt is a rejection, so closing those stays out of
	// the dismissal count - a site whose write failed twice would otherwise be counted as having
	// said no twice, and never asked again.
	const hideNotice = () => setDismissedSiteId( siteId );

	const enablePremiumAnalyticsPreview = async () => {
		trackEvent( isOdyssey, 'enable_button_clicked', siteId );
		setFailedSiteId( null );

		try {
			const enabled = await enablePreviewAsync( true );
			shouldRestoreFocus.current = true;

			if ( ! enabled ) {
				trackEvent( isOdyssey, 'enable_failed', siteId, { reason: 'not_enabled' } );
				setFailedSiteId( siteId );
				return;
			}

			trackEvent( isOdyssey, 'enabled', siteId );

			// Hand over a link rather than navigating for them: the dashboard only exists on a
			// fresh page load, and being thrown out of the page you were reading is a poor reward
			// for saying yes.
			//
			// Deliberately no dismissal here. An enabled site already fails the eligibility rule, so
			// the invitation is gone on the next load either way — and recording one would refetch
			// the notices, which now answers "dismissed" and unmounts this notice mid-sentence,
			// taking the link with it.
			setEnabledSiteId( siteId );
		} catch {
			shouldRestoreFocus.current = true;
			trackEvent( isOdyssey, 'enable_failed', siteId, { reason: 'request_failed' } );
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
			trackEvent( isOdyssey, 'viewed', siteId );
		}
	}, [ noticeDismissed, isOdyssey, siteId ] );

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
