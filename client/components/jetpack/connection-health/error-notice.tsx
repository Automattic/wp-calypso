import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	errorType: string;
	errorText: string;
	noticeActionHref: string;
	noticeActionText: string;
}

export const ErrorNotice = ( {
	errorType,
	errorText,
	noticeActionHref,
	noticeActionText,
}: Props ) => {
	const dispatch = useDispatch();

	const handleJetpackConnectionHealthLinkClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_connection_health_issue_click', {
				error_type: errorType,
			} )
		);
	};

	return (
		<>
			<TrackComponentView
				eventName="calypso_jetpack_connection_health_issue_view"
				eventProperties={ { error_type: errorType } }
			/>
			<Notice status="is-error" showDismiss={ false } text={ errorText }>
				{ noticeActionText && noticeActionHref && (
					<NoticeAction
						href={ noticeActionHref }
						external
						onClick={ handleJetpackConnectionHealthLinkClick }
					>
						{ noticeActionText }
					</NoticeAction>
				) }
			</Notice>
		</>
	);
};
