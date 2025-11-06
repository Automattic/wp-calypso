import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import Notice from '../notice';

interface TimeMismatchNoticeProps {
	settingsUrl?: string | null;
	siteTime: string | number;
	siteId: number;
}

export const TimeMismatchNotice = ( {
	settingsUrl,
	siteTime,
	siteId,
}: TimeMismatchNoticeProps ) => {
	const { recordTracksEvent } = useAnalytics();
	const { data: dismissedPref } = useSuspenseQuery(
		userPreferenceQuery( `hosting-dashboard-time-mismatch-warning-dismissed-${ siteId }` )
	);
	const { mutate: dismiss, isPending: isDismissing } = useMutation(
		userPreferenceMutation( `hosting-dashboard-time-mismatch-warning-dismissed-${ siteId }` )
	);

	const date = new Date();
	const offsetHours = -date.getTimezoneOffset() / 60;
	let savedOffset: number | null = null;

	if ( isDismissing || dismissedPref ) {
		try {
			if ( typeof dismissedPref === 'string' ) {
				const parsed = JSON.parse( dismissedPref );
				savedOffset = parsed.offsetHours;
			}
		} catch {
			savedOffset = null;
		}
	}

	if ( siteTime === offsetHours || isDismissing || savedOffset === offsetHours ) {
		return null;
	}

	const reason = createInterpolateElement(
		/** Translators: settingsLink is a link to the site general options page. */
		__(
			"This page uses your site's time zone, which differs from yours. <settingsLink>You can update it if needed</settingsLink>."
		),
		{
			settingsLink: (
				<ExternalLink
					href={ settingsUrl || '#' }
					onClick={ () =>
						recordTracksEvent( 'calypso_dashboard_time_mismatch_banner_settings_link_click', {
							site_id: siteId,
						} )
					}
					children={ null }
				/>
			),
		}
	);

	const handleClose = () => {
		// Persist dismissal with timestamp + current offset
		const dismissedAt = new Date().toISOString();
		dismiss( JSON.stringify( { dismissedAt: dismissedAt, offsetHours } ) );
		recordTracksEvent( 'calypso_dashboard_time_mismatch_banner_close', {
			site_id: siteId,
			dismissed_at: dismissedAt,
		} );
	};

	return (
		<Notice variant="warning" onClose={ handleClose }>
			{ reason }
		</Notice>
	);
};

export default TimeMismatchNotice;
