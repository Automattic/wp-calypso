import { BigSkyLogo } from '@automattic/components';
import { MarkdownOrChildren } from '../mardown-or-children';
import type { Message } from '../../../types';
import './style.scss';

export const IntroductionMessage = ( {
	content,
	isFromAi = true,
}: {
	content: Message[ 'content' ];
	// A greeting from a chat that a person answers doesn't show the AI's logo.
	isFromAi?: boolean;
} ) => (
	<div className="odie-introduction-message-content">
		{ isFromAi && (
			<div className="odie-introduction-big-sky-logo">
				<BigSkyLogo.CentralLogo heartless size={ 50 } fill="#3858E9" />
			</div>
		) }

		<div className="odie-chatbox-introduction-message">
			<MarkdownOrChildren messageContent={ content } />
		</div>
	</div>
);
