import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import ReaderJoinConversationDialog from 'calypso/blocks/reader-join-conversation/dialog';

const ReaderJoinConversationDialogExample = () => {
	const translate = useTranslate();
	const [ isVisible, setIsVisible ] = useState( false );

	return (
		<div className="docs__design-assets-group">
			<Button onClick={ () => setIsVisible( true ) }>
				{ translate( "Show the Reader's 'Join Conversation' dialog" ) }
			</Button>
			<ReaderJoinConversationDialog
				onClose={ () => setIsVisible( false ) }
				isVisible={ isVisible }
				onLoginSuccess={ () => window.location.reload() }
			/>
		</div>
	);
};

export default ReaderJoinConversationDialogExample;
