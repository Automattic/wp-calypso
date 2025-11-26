/**
 * ConversationListSkeleton Component
 * Loading skeleton that mimics the ConversationListItem structure
 */

import { memo } from '@wordpress/element';
import './style.scss';

interface ConversationListSkeletonProps {
	count?: number;
}

const SkeletonItem = () => (
	<div className="agents-manager-conversation-list-skeleton__item">
		<div className="agents-manager-conversation-list-skeleton__avatar" />
		<div className="agents-manager-conversation-list-skeleton__text">
			<div className="agents-manager-conversation-list-skeleton__title" />
			<div className="agents-manager-conversation-list-skeleton__subtitle" />
		</div>
	</div>
);

const ConversationListSkeleton = memo( ( { count = 3 }: ConversationListSkeletonProps ) => {
	return (
		<div className="agents-manager-conversation-list-skeleton">
			{ Array.from( { length: count } ).map( ( _, index ) => (
				<SkeletonItem key={ index } />
			) ) }
		</div>
	);
} );

ConversationListSkeleton.displayName = 'ConversationListSkeleton';

export default ConversationListSkeleton;
