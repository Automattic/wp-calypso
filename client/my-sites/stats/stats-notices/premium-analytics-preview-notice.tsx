import { recordTracksEvent } from '@automattic/calypso-analytics';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { localizeUrl } from '@automattic/i18n-utils';
import { CALYPSO_CONTACT, JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import usePremiumAnalyticsStatusMutation from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation';
import { useSelector } from 'calypso/state';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { StatsNoticeProps } from './types';

const PREMIUM_ANALYTICS_PAGE_PATH = 'admin.php?page=jetpack-premium-analytics-wp-admin';

const DAY_IN_SECONDS = 24 * 3600;
const FIRST_DISMISSAL_POSTPONEMENT = 30 * DAY_IN_SECONDS;
const FINAL_DISMISSAL_POSTPONEMENT = 3650 * DAY_IN_SECONDS;

const dismissalCountKey = ( siteId: number | null ) =>
	`jetpack_stats_premium_analytics_preview_dismissals_${ siteId }`;

/**
 * How many times this browser has been shown the door on this site.
 *
 * The invitation returns once after the first dismissal and never after the second. The notices
 * endpoint reports current visibility rather than a history, so the count is kept locally: a
 * cleared browser store costs at most one extra invitation.
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
	isOdysseyStats: boolean,
	name: string,
	siteId: number | null,
	properties: Record< string, unknown > = {}
) => {
	const prefix = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
	recordTracksEvent( `${ prefix }_stats_premium_analytics_preview_notice_${ name }`, {
		blog_id: siteId,
		...properties,
	} );
};

const NoticeContainer = ( {
	isOdysseyStats,
	children,
}: {
	isOdysseyStats: boolean;
	children: React.ReactNode;
} ) => (
	<div
		className={ `inner-notice-container ${
			! isOdysseyStats ? 'inner-notice-container--calypso' : ''
		}` }
	>
		{ children }
	</div>
);

const PremiumAnalyticsPreviewNotice = ( { siteId, isOdysseyStats }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const dashboardUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, PREMIUM_ANALYTICS_PAGE_PATH )
	);
	// Scoped to the site rather than held as a flag: the notices host reuses this component across
	// site switches in Calypso, so a plain boolean would carry one site's dismissal to the next.
	const [ dismissedSiteId, setDismissedSiteId ] = useState< number | null >( null );
	const [ failedSiteId, setFailedSiteId ] = useState< number | null >( null );
	const [ enabledSiteId, setEnabledSiteId ] = useState< number | null >( null );

	const noticeDismissed = dismissedSiteId === siteId;
	const enableFailed = failedSiteId === siteId;
	const isSwitchedOn = enabledSiteId === siteId;

	const { mutateAsync: enablePreviewAsync, isPending: isEnabling } =
		usePremiumAnalyticsStatusMutation( siteId );

	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'premium_analytics_preview',
		'postponed',
		FIRST_DISMISSAL_POSTPONEMENT
	);
	const { mutateAsync: postponeNoticeIndefinitelyAsync } = useNoticeVisibilityMutation(
		siteId,
		'premium_analytics_preview',
		'postponed',
		FINAL_DISMISSAL_POSTPONEMENT
	);

	const dismissNotice = () => {
		const dismissalCount = readDismissalCount( siteId ) + 1;
		const isFinalDismissal = dismissalCount > 1;

		trackEvent( isOdysseyStats, 'dismissed', siteId, { dismissal_count: dismissalCount } );
		writeDismissalCount( siteId, dismissalCount );
		setDismissedSiteId( siteId );

		// Best-effort: the local state above already hides the notice for this session.
		const postpone = isFinalDismissal ? postponeNoticeIndefinitelyAsync : postponeNoticeAsync;
		postpone().catch( () => {} );
	};

	// Closing the confirmation is not a rejection, so it stays out of the dismissal count.
	const hideNotice = () => setDismissedSiteId( siteId );

	const enablePremiumAnalyticsPreview = async () => {
		trackEvent( isOdysseyStats, 'enable_button_clicked', siteId );
		setFailedSiteId( null );

		try {
			const enabled = await enablePreviewAsync( true );
			if ( ! enabled ) {
				setFailedSiteId( siteId );
				return;
			}

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
			setFailedSiteId( siteId );
		}
	};

	useEffect( () => {
		if ( ! noticeDismissed ) {
			trackEvent( isOdysseyStats, 'viewed', siteId );
		}
	}, [ noticeDismissed, isOdysseyStats, siteId ] );

	// Without somewhere to land, accepting would switch the dashboard on and drop the customer on a
	// 404. getSiteAdminUrl() returns null when the site record carries no admin_url.
	if ( noticeDismissed || ! dashboardUrl ) {
		return null;
	}

	if ( isSwitchedOn ) {
		return (
			<NoticeContainer isOdysseyStats={ isOdysseyStats }>
				<NoticeBanner
					level="success"
					title={ translate( 'The new Traffic page is on' ) }
					onClose={ hideNotice }
				>
					<p key="desc">
						{ translate( 'You’ll find it in the main menu alongside your current Stats.' ) }
					</p>
					<p key="cta">
						<Button variant="primary" href={ dashboardUrl }>
							{ translate( 'Go to the new Traffic page' ) }
						</Button>
					</p>
				</NoticeBanner>
			</NoticeContainer>
		);
	}

	if ( enableFailed ) {
		return (
			<NoticeContainer isOdysseyStats={ isOdysseyStats }>
				<NoticeBanner
					level="error"
					title={ translate( 'We couldn’t switch on the new Traffic page' ) }
					onClose={ dismissNotice }
				>
					<p key="desc" role="alert">
						{ translate(
							'Something went wrong on our end. Please try again — if it keeps happening, get in touch with support.'
						) }
					</p>
					<p key="cta">
						<Button variant="primary" onClick={ enablePremiumAnalyticsPreview }>
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
		<NoticeContainer isOdysseyStats={ isOdysseyStats }>
			<NoticeBanner
				level="info"
				title={ translate( 'Try the new Traffic page' ) }
				// Nothing to dismiss halfway through a write that is about to change the answer.
				hideCloseButton={ isEnabling }
				onClose={ dismissNotice }
			>
				<p key="desc">
					{ translate(
						'Clearer charts, and widgets you can move and resize to suit how you read your site. It’s an early version — your current Stats stay where they are.'
					) }
				</p>
				<p key="cta">
					<Button
						variant="primary"
						onClick={ enablePremiumAnalyticsPreview }
						isBusy={ isEnabling }
						disabled={ isEnabling }
					>
						{ isEnabling ? translate( 'Switching it on…' ) : translate( 'Switch it on' ) }
					</Button>
				</p>
			</NoticeBanner>
		</NoticeContainer>
	);
};

export default PremiumAnalyticsPreviewNotice;
