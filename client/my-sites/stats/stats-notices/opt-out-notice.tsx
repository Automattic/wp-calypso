import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { StatsNoticeProps, NoticeBodyProps } from './types';

export const OptOutNoticeBody = ( { onNoticeDismiss }: NoticeBodyProps ) => {
	const translate = useTranslate();

	return (
		<div className="inner-notice-container has-odyssey-stats-bg-color">
			<NoticeBanner
				level="success"
				title={ translate( 'Welcome to the new Jetpack Stats!' ) }
				onClose={ onNoticeDismiss }
			>
				{ translate(
					'{{p}}Enjoy a more modern and mobile friendly experience with new stats and insights to help you grow your site.{{/p}}{{p}}If you prefer to continue using the traditional stats, {{manageYourSettingsLink}}manage your settings{{/manageYourSettingsLink}}.{{/p}}',
					{
						components: {
							p: <p />,
							manageYourSettingsLink: (
								<a href="/wp-admin/admin.php?page=jetpack#/settings?term=stats" />
							),
						},
					}
				) }
			</NoticeBanner>
		</div>
	);
};

const OptOutNotice = ( { siteId }: StatsNoticeProps ) => {
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { data: showOptOutNotice } = useNoticeVisibilityQuery( siteId, 'opt_out_new_stats' );
	const { mutateAsync: dismissOptOutNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'opt_out_new_stats'
	);
	const dismissOptOutNotice = () => {
		setNoticeDismissed( true );
		dismissOptOutNoticeAsync();
	};

	if ( noticeDismissed || ! showOptOutNotice ) {
		return null;
	}

	return <OptOutNoticeBody onNoticeDismiss={ dismissOptOutNotice } />;
};

export default OptOutNotice;
