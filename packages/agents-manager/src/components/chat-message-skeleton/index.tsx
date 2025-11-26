/**
 * ChatMessageSkeleton Component
 * Loading skeleton that mimics chat message bubbles
 */

import { memo } from '@wordpress/element';
import clsx from 'clsx';
import './style.scss';

interface ChatMessageSkeletonProps {
	count?: number;
}

const SkeletonMessage = ( { isUser }: { isUser: boolean } ) => (
	<div
		className={ clsx( 'agents-manager-chat-message-skeleton__message', {
			'agents-manager-chat-message-skeleton__message--user': isUser,
			'agents-manager-chat-message-skeleton__message--assistant': ! isUser,
		} ) }
	>
		{ isUser ? (
			<div className="agents-manager-chat-message-skeleton__bubble">
				<div className="agents-manager-chat-message-skeleton__line agents-manager-chat-message-skeleton__line--long" />
				<div className="agents-manager-chat-message-skeleton__line agents-manager-chat-message-skeleton__line--medium" />
			</div>
		) : (
			<div className="agents-manager-chat-message-skeleton__text">
				<div className="agents-manager-chat-message-skeleton__line agents-manager-chat-message-skeleton__line--long" />
				<div className="agents-manager-chat-message-skeleton__line agents-manager-chat-message-skeleton__line--medium" />
				<div className="agents-manager-chat-message-skeleton__line agents-manager-chat-message-skeleton__line--short" />
			</div>
		) }
	</div>
);

export const ChatMessageSkeleton = memo( ( { count = 3 }: ChatMessageSkeletonProps ) => {
	return (
		<div className="agents-manager-chat-message-skeleton">
			{ Array.from( { length: count } ).map( ( _, index ) => (
				<SkeletonMessage key={ index } isUser={ index % 2 === 0 } />
			) ) }
		</div>
	);
} );

ChatMessageSkeleton.displayName = 'ChatMessageSkeleton';
