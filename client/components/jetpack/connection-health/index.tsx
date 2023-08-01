import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';

export const JetpackConnectionHealthBanner = () => {
	const translate = useTranslate();

	return (
		<Notice
			status="is-error"
			showDismiss={ false }
			text={ translate( 'Jetpack connection failed.' ) }
		>
			<NoticeAction
				href={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-sites-jetpack-connection'
				) }
				external
			>
				Attempt reconnection
			</NoticeAction>
		</Notice>
	);
};
