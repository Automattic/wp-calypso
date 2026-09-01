import { recordTracksEvent } from '@automattic/calypso-analytics';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import usePremiumAnalyticsStatusMutation from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-mutation';
import usePremiumAnalyticsStatusQuery from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import { useSelector } from 'calypso/state';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { StatsNoticeProps } from './types';

const PREMIUM_ANALYTICS_PAGE_SLUG = 'jetpack-premium-analytics-wp-admin';

const trackEvent = ( isOdysseyStats: boolean, name: string, siteId: number | null ) => {
	const prefix = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
	recordTracksEvent( `${ prefix }_stats_traffic_tab_preview_notice_${ name }`, {
		blog_id: siteId,
	} );
};

const TrafficTabPreviewNotice = ( { siteId, isOdysseyStats }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );

	const { data: isAlreadyEnabled, isLoading, isError } = usePremiumAnalyticsStatusQuery( siteId );
	const { mutate: enablePreview, isPending: isEnabling } =
		usePremiumAnalyticsStatusMutation( siteId );

	// Dismissal is news-based, not time-based: the invitation shouldn't come back on a timer, and a
	// later campaign can re-reach past dismissers by shipping under a fresh notice id.
	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'traffic_tab_preview',
		'postponed',
		3650 * 24 * 3600
	);

	// A failed status read stands in for two cases that both mean "don't invite this person": the
	// route 403s for anyone who can't administer the site, and it doesn't exist at all on a Jetpack
	// too old to serve it. Either way there is no point offering a switch they can't throw.
	const isVisible = ! noticeDismissed && ! isLoading && ! isError && ! isAlreadyEnabled;

	const dismissNotice = () => {
		trackEvent( isOdysseyStats, 'dismissed', siteId );

		setNoticeDismissed( true );
		// Best-effort: the local state above already hides the notice for this session.
		postponeNoticeAsync().catch( () => {} );
	};

	const enableTrafficTabPreview = () => {
		trackEvent( isOdysseyStats, 'enable_button_clicked', siteId );

		enablePreview( true, {
			onSuccess: () => {
				// The site only picks the flag up on a fresh page load, so land the customer in the
				// dashboard rather than re-rendering here. Dismiss too: the invitation has been
				// accepted, and classic Stats stays reachable from the menu.
				postponeNoticeAsync().catch( () => {} );
				window.location.href = `${ adminUrl }admin.php?page=${ PREMIUM_ANALYTICS_PAGE_SLUG }`;
			},
		} );
	};

	useEffect( () => {
		if ( isVisible ) {
			trackEvent( isOdysseyStats, 'viewed', siteId );
		}
		// Fires once the notice actually reaches the screen, which is a request later than mount.
	}, [ isVisible, isOdysseyStats, siteId ] );

	if ( ! isVisible ) {
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
