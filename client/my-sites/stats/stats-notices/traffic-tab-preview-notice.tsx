import { recordTracksEvent } from '@automattic/calypso-analytics';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import usePremiumAnalyticsStatusMutation from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation';
import { useSelector } from 'calypso/state';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { StatsNoticeProps } from './types';

const PREMIUM_ANALYTICS_PAGE_PATH = 'admin.php?page=jetpack-premium-analytics-wp-admin';

const trackEvent = ( isOdysseyStats: boolean, name: string, siteId: number | null ) => {
	const prefix = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
	recordTracksEvent( `${ prefix }_stats_traffic_tab_preview_notice_${ name }`, {
		blog_id: siteId,
	} );
};

const TrafficTabPreviewNotice = ( { siteId, isOdysseyStats }: StatsNoticeProps ) => {
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
	const isEnabled = enabledSiteId === siteId;

	const { mutateAsync: enablePreviewAsync, isPending: isEnabling } =
		usePremiumAnalyticsStatusMutation( siteId );

	// Dismissal is news-based, not time-based: the invitation shouldn't come back on a timer, and a
	// later campaign can re-reach past dismissers by shipping under a fresh notice id.
	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'traffic_tab_preview',
		'postponed',
		3650 * 24 * 3600
	);

	const dismissNotice = () => {
		trackEvent( isOdysseyStats, 'dismissed', siteId );

		setDismissedSiteId( siteId );
		// Best-effort: the local state above already hides the notice for this session.
		postponeNoticeAsync().catch( () => {} );
	};

	const enableTrafficTabPreview = async () => {
		trackEvent( isOdysseyStats, 'enable_button_clicked', siteId );
		setFailedSiteId( null );

		try {
			const { enabled } = await enablePreviewAsync( true );
			if ( ! enabled ) {
				setFailedSiteId( siteId );
				return;
			}

			// Hand over a link rather than navigating for them: the dashboard only exists on a
			// fresh page load, and being thrown out of the page you were reading is a poor reward
			// for saying yes.
			setEnabledSiteId( siteId );

			// Retire the invitation, but never make anyone wait on it. It is a slow round-trip that
			// can fail on its own, the local state above has already hidden the invitation here,
			// and nothing navigates away from this page now, so it has time to land.
			postponeNoticeAsync().catch( () => {} );
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

	return (
		<div
			className={ `inner-notice-container ${
				! isOdysseyStats ? 'inner-notice-container--calypso' : ''
			}` }
		>
			<NoticeBanner
				level="info"
				title={ translate( 'Try the new Traffic page' ) }
				onClose={ dismissNotice }
			>
				<p key="desc">
					{ isEnabled
						? translate( 'The new Traffic page is switched on for this site.' )
						: translate(
								'We’ve rebuilt your traffic stats from the ground up — clearer charts, and widgets you can move and resize to suit how you read your site. You can switch it on for this site and take a look.'
						  ) }
				</p>
				{ enableFailed && (
					<p key="error" role="alert">
						{ translate( 'Something went wrong switching it on. Please try again.' ) }
					</p>
				) }
				<p key="cta">
					{ isEnabled ? (
						<Button variant="primary" href={ dashboardUrl }>
							{ translate( 'Go to the new Traffic page' ) }
						</Button>
					) : (
						<Button
							variant="primary"
							onClick={ enableTrafficTabPreview }
							isBusy={ isEnabling }
							disabled={ isEnabling }
						>
							{ isEnabling ? translate( 'Switching it on…' ) : translate( 'Try it now' ) }
						</Button>
					) }
				</p>
			</NoticeBanner>
		</div>
	);
};

export default TrafficTabPreviewNotice;
