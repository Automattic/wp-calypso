import { recordTracksEvent } from '@automattic/calypso-analytics';
import NoticeBanner from '@automattic/components/src/notice-banner';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { StatsNoticeProps } from './types';

const GDPRCookieConsentNotice = ( { siteId, isOdysseyStats }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );

	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'gdpr_cookie_consent',
		'postponed',
		7 * 24 * 3600
	);

	const dismissNotice = () => {
		isOdysseyStats
			? recordTracksEvent( 'jetpack_odyssey_stats_gdpr_cookie_consent_notice_dismissed' )
			: recordTracksEvent( 'calypso_stats_gdpr_cookie_consent_notice_dismissed' );

		setNoticeDismissed( true );
		postponeNoticeAsync();
	};

	if ( noticeDismissed ) {
		return null;
	}

	const classNames = clsx(
		'inner-notice-container has-odyssey-stats-bg-color',
		! isOdysseyStats && 'inner-notice-container--calypso'
	);

	const bannerBody = isOdysseyStats
		? translate(
				'To fix, go to {{link}}Complianz settings{{/link}} use the toggle to disable Jetpack integration.',
				{
					components: {
						link: <a href="/wp-admin/admin.php?page=complianz#integrations/integrations-plugins" />,
					},
				}
		  )
		: translate(
				'To fix, go to Complianz > Integrations > Plugins and use the toggle to disable Jetpack integration.'
		  );

	return (
		<div className={ classNames }>
			<NoticeBanner
				level="warning"
				title={ translate(
					'Complianz - GDBR/CCPA Cookie Consent plugin is not allowing Jetpack Stats to update'
				) }
				onClose={ dismissNotice }
			>
				<p>{ bannerBody }</p>
			</NoticeBanner>
		</div>
	);
};

export default GDPRCookieConsentNotice;
