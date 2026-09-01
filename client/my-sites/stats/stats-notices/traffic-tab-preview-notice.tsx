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

	const noticeDismissed = dismissedSiteId === siteId;
	const enableFailed = failedSiteId === siteId;

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
			// Record the dismissal first and wait for it. Navigation tears down the proxy iframe
			// Calypso posts these through, so a request fired alongside it can be lost — and losing
			// this one leaves the invitation standing after it has been accepted.
			await postponeNoticeAsync().catch( () => {} );

			const { enabled } = await enablePreviewAsync( true );
			if ( ! enabled ) {
				setFailedSiteId( siteId );
				return;
			}

			// The site only picks the flag up on a fresh page load, so send the customer into the
			// dashboard rather than re-rendering here.
			window.location.href = dashboardUrl as string;
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
					{ translate(
						'We’ve rebuilt your traffic stats from the ground up — clearer charts, and widgets you can move and resize to suit how you read your site. You can switch it on for this site and take a look.'
					) }
				</p>
				{ enableFailed && (
					<p key="error" role="alert">
						{ translate( 'Something went wrong switching it on. Please try again.' ) }
					</p>
				) }
				<p key="cta">
					<Button
						variant="primary"
						onClick={ enableTrafficTabPreview }
						isBusy={ isEnabling }
						disabled={ isEnabling }
					>
						{ translate( 'Try it now' ) }
					</Button>
				</p>
			</NoticeBanner>
		</div>
	);
};

export default TrafficTabPreviewNotice;
