import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useCheckJetpackConnectionHealth } from './use-check-jetpack-connection-health';

interface Props {
	siteId: number;
}

export const JetpackConnectionHealthBanner = ( { siteId }: Props ) => {
	const translate = useTranslate();

	const [ isErrorCheckJetpackConnectionHealth, setIsErrorCheckJetpackConnectionHealth ] =
		useState( false );

	const { data: jetpackConnectionHealth, isLoading: isLoadingJetpackConnectionHealth } =
		useCheckJetpackConnectionHealth( siteId, {
			onError: () => {
				setIsErrorCheckJetpackConnectionHealth( true );
			},
		} );

	if (
		isLoadingJetpackConnectionHealth ||
		isErrorCheckJetpackConnectionHealth ||
		jetpackConnectionHealth?.is_healthy
	) {
		return;
	}

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
