/**
 * ConversationListSkeleton Component
 * Loading skeleton that mimics the ConversationListItem structure
 */

import { __ } from '@wordpress/i18n';
import './style.scss';

interface Props {
	count?: number;
}

function SkeletonItem() {
	return (
		<div className="agents-manager-conversation-list-skeleton__item" aria-hidden="true">
			<div className="agents-manager-conversation-list-skeleton__avatar" />
			<div className="agents-manager-conversation-list-skeleton__text">
				<div className="agents-manager-conversation-list-skeleton__title" />
				<div className="agents-manager-conversation-list-skeleton__subtitle" />
			</div>
		</div>
	);
}

export default function ConversationListSkeleton( { count = 3 }: Props ) {
	return (
		<div
			className="agents-manager-conversation-list-skeleton"
			role="status"
			aria-label={ __( 'Loading conversations', '__i18n_text_domain__' ) }
			aria-busy="true"
		>
			{ Array.from( { length: count } ).map( ( _, index ) => (
				<SkeletonItem key={ index } />
			) ) }
		</div>
	);
}
