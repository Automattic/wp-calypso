import { NoticeBanner } from '@automattic/components';
import { useEffect } from '@wordpress/element';
import { localize, useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

const getPreferenceName = ( isInternal ) =>
	isInternal ? 'has_used_reader_conversations_a8c' : 'has_used_reader_conversations';

const ConversationsIntro = ( { isInternal = false, hasUsedConversations, dismiss } ) => {
	const translate = useTranslate();
	useEffect( () => {
		if ( hasUsedConversations !== true ) {
			recordReaderTracksEvent( 'calypso_reader_conversations_intro_render' );
		}
	}, [ hasUsedConversations ] );

	const onClose = () => {
		recordReaderTracksEvent( 'calypso_reader_conversations_intro_dismiss' );
		dismiss( isInternal );
	};

	if ( hasUsedConversations ) {
		return null;
	}
	return (
		<>
			<QueryPreferences />
			<NoticeBanner
				level="info"
				title={ translate( 'Welcome to A8C Conversations.' ) }
				onClose={ onClose }
			>
				<span>
					{ isInternal
						? translate(
								`Automattic P2 posts you've written, followed, or commented on will appear here when they have new comments. ` +
									`Posts with the most recent comments appear on top. ` +
									`{{a}}More info.{{/a}}`,
								{
									components: {
										a: <a href="http://wp.me/p5PDj3-44u" />,
									},
								}
						  )
						: translate(
								`WordPress posts you've written, followed, or commented on will appear here when they have new comments. Posts with the most recent comments appear on top.`
						  ) }
				</span>
			</NoticeBanner>
		</>
	);
};

export default connect(
	( state, ownProps ) => {
		const preferenceName = getPreferenceName( ownProps.isInternal );
		return {
			hasUsedConversations: getPreference( state, preferenceName ),
		};
	},
	{
		dismiss: ( isInternal ) => {
			const preferenceName = getPreferenceName( isInternal );
			return savePreference( preferenceName, true );
		},
	}
)( localize( ConversationsIntro ) );
