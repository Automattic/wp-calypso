import { NoticeBanner } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

const ConversationsIntro = ( { isInternal = false } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const preferenceName = isInternal
		? 'has_used_reader_conversations_a8c'
		: 'has_used_reader_conversations';
	const hasUsedConversations = useSelector( ( state ) => getPreference( state, preferenceName ) );
	useEffect( () => {
		if ( ! hasUsedConversations ) {
			recordReaderTracksEvent( 'calypso_reader_conversations_intro_render' );
		}
	}, [ hasUsedConversations ] );
	if ( hasUsedConversations ) {
		return null;
	}
	const onClose = () => {
		recordReaderTracksEvent( 'calypso_reader_conversations_intro_dismiss' );
		dispatch( savePreference( preferenceName, true ) );
	};
	return (
		<>
			<QueryPreferences />
			<NoticeBanner
				level="info"
				title={
					isInternal
						? translate( 'Welcome to A8C Conversations.' )
						: translate( 'Welcome to Conversations.' )
				}
				onClose={ onClose }
			>
				{ isInternal
					? translate(
							`Automattic P2 posts you've written, followed, or commented on will appear here when they have new comments. ` +
								`Posts with the most recent comments appear on top. ` +
								`{{a}}More info{{/a}}`,
							{
								components: {
									a: <ExternalLink href="http://wp.me/p5PDj3-44u" />,
								},
							}
					  )
					: translate(
							`WordPress posts you've written, followed, or commented on will appear here when they have new comments. Posts with the most recent comments appear on top.`
					  ) }
			</NoticeBanner>
		</>
	);
};

export default ConversationsIntro;
