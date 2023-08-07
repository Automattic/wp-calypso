import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useCheckJetpackConnectionHealth } from './use-check-jetpack-connection-health';

interface Props {
	siteId: number;
}

export const JetpackConnectionHealthBanner = ( { siteId }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isErrorCheckJetpackConnectionHealth, setIsErrorCheckJetpackConnectionHealth ] =
		useState( false );

	const { data: jetpackConnectionHealth, isLoading: isLoadingJetpackConnectionHealth } =
		useCheckJetpackConnectionHealth( siteId, {
			onError: () => {
				setIsErrorCheckJetpackConnectionHealth( true );
			},
		} );

	const handleJetpackConnectionHealthLinkClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_connection_health_issue_click', {
				error_type: 'default',
			} )
		);
	};

	if (
		isLoadingJetpackConnectionHealth ||
		isErrorCheckJetpackConnectionHealth ||
		jetpackConnectionHealth?.is_healthy
	) {
		return;
	}

	return (
		<>
			<TrackComponentView
				eventName="calypso_jetpack_connection_health_issue_view"
				eventProperties={ { error_type: 'default' } }
			/>
			<Notice
				status="is-error"
				showDismiss={ false }
				text={ translate( 'Jetpack is unable to communicate with your site.' ) }
			>
				<NoticeAction
					href={ localizeUrl(
						'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-sites-jetpack-connection'
					) }
					external
					onClick={ handleJetpackConnectionHealthLinkClick }
				>
					{ translate( 'Learn how to fix' ) }
				</NoticeAction>
			</Notice>
		</>
	);
};
