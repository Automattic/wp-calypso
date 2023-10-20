import { Button } from '@automattic/components';
import { useState } from 'react';
import ReaderJoinConversationDialog from 'calypso/blocks/reader-join-conversation/dialog';

const ReaderJoinConversationDialogExample = () => {
	const [ isVisible, setIsVisible ] = useState( false );

	return (
		<div className="docs__design-assets-group">
			<Button onClick={ () => setIsVisible( true ) }>Show Reader Join Conversation Dialog</Button>
			<ReaderJoinConversationDialog
				onClose={ () => setIsVisible( false ) }
				isVisible={ isVisible }
			/>
		</div>
	);
};

export default ReaderJoinConversationDialogExample;
