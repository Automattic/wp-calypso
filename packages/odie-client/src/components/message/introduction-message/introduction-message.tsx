import { BigSkyLogo } from '@automattic/components';
import { MarkdownOrChildren } from '../mardown-or-children';
import { QuickReplyOptions } from './quick-reply-options';
import type { Message } from '../../../types';
import './style.scss';

export const IntroductionMessage = ( {
	content,
	metadata,
}: {
	content: Message[ 'content' ];
	metadata: Message[ 'metadata' ];
} ) => {
	const quickReplies = ( metadata?.[ 'quick_replies' ] as string[] ) || [];

	return (
		<div className="odie-introduction-message-content">
			<div className="odie-introduction-big-sky-logo">
				<BigSkyLogo.CentralLogo heartless size={ 50 } fill="#3858E9" />
			</div>

			<div className="odie-chatbox-introduction-message">
				<MarkdownOrChildren messageContent={ content } />
				{ !! quickReplies.length && <QuickReplyOptions options={ quickReplies } /> }
			</div>
		</div>
	);
};
