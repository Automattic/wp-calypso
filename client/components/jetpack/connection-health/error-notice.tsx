import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	eventViewName: string;
	eventClickName: string;
	eventType: string;
	errorText: string;
	noticeActionHref: string;
	noticeActionText: string;
}

export const ErrorNotice = ( {
	eventViewName,
	eventClickName,
	errorText,
	noticeActionHref,
	noticeActionText,
}: Props ) => {
	const dispatch = useDispatch();

	const handleJetpackConnectionHealthLinkClick = () => {
		dispatch(
			recordTracksEvent( eventClickName, {
				type: eventType,
			} )
		);
	};

	return (
		<>
			<TrackComponentView eventName={ eventViewName } eventProperties={ { type: eventType } } />
			<Notice status="is-error" showDismiss={ false } text={ errorText }>
				<NoticeAction
					href={ noticeActionHref }
					external
					onClick={ handleJetpackConnectionHealthLinkClick }
				>
					{ noticeActionText }
				</NoticeAction>
			</Notice>
		</>
	);
};
