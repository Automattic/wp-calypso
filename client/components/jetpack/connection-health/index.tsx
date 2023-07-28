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

	const [ isErrorCheckJetpackConnectionHealth, setIsCheckJetpackConnectionHealth ] =
		useState( false );

	const { data: jetpackConnectionHealth, isLoading: isLoadingJetpackConnectionHealth } =
		useCheckJetpackConnectionHealth( siteId, {
			onError: () => {
				setIsCheckJetpackConnectionHealth( true );
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
			status="is-warning"
			showDismiss={ false }
			text={ translate( 'Jetpack connection failed.' ) }
		>
			<NoticeAction href="#" external>
				Attempt reconnection
			</NoticeAction>
		</Notice>
	);
};
