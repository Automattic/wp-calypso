import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import NoteIcon from '../../note-icon';
import { NoteTime } from './note-meta';
import type { Commenter } from '../data/person';
import type { RepliedTo } from '../data/replied-to';
import type { ReactNode } from 'react';

const ThreadItem = ( {
	avatar,
	author,
	authorUrl,
	meta,
	status,
	children,
}: {
	avatar?: string;
	author?: string;
	authorUrl?: string;
	meta?: ReactNode;
	status?: ReactNode;
	children: ReactNode;
} ) => {
	const photo = <NoteIcon className="wpnc-simplified__photo" icon={ avatar } size={ 36 } />;
	const name = author && (
		<Text size={ 15 } weight={ 600 }>
			{ authorUrl ? (
				<a href={ authorUrl } target="_blank" rel="noreferrer">
					{ author }
				</a>
			) : (
				author
			) }
		</Text>
	);

	return (
		<HStack
			as="li"
			className="wpnc-simplified__thread-item"
			alignment="top"
			justify="flex-start"
			spacing={ 3 }
		>
			{ authorUrl ? (
				// The name beside it links to the same profile, so the photo stays out of the tab order.
				<a
					className="wpnc-simplified__photo"
					href={ authorUrl }
					target="_blank"
					rel="noreferrer"
					tabIndex={ -1 }
					aria-hidden="true"
				>
					{ photo }
				</a>
			) : (
				photo
			) }
			<VStack className="wpnc-simplified__thread-content" spacing={ 1 }>
				<HStack className="wpnc-simplified__thread-header">
					<HStack alignment="baseline" spacing={ 2 }>
						<HStack
							className="wpnc-simplified__quiet-links"
							alignment="baseline"
							justify="flex-start"
							spacing={ 2 }
							wrap
						>
							{ name }
							{ meta }
						</HStack>
						{ status }
					</HStack>
				</HStack>
				{ children }
			</VStack>
		</HStack>
	);
};

/**
 * The conversation a note belongs to, oldest first: the comment being answered or
 * liked, then the new comment, passed as children.
 */
export default function Thread( {
	repliedTo,
	commenter,
	meta,
	status,
	children,
}: {
	repliedTo?: RepliedTo;
	commenter?: Commenter;
	/** When the new comment was made, and anything else worth knowing about its author. */
	meta?: ReactNode;
	/** The new comment's moderation state, shown opposite its author. */
	status?: ReactNode;
	children?: ReactNode;
} ) {
	return (
		<VStack as="ol" className="wpnc-simplified__thread" spacing={ 0 }>
			{ repliedTo && (
				<ThreadItem
					avatar={ repliedTo.avatar }
					author={ repliedTo.author }
					authorUrl={ repliedTo.authorUrl }
					meta={
						repliedTo.date && (
							<Text className="wpnc-simplified__quiet-links" size={ 12 } variant="muted">
								<NoteTime timestamp={ repliedTo.date } url={ repliedTo.url } />
							</Text>
						)
					}
				>
					<div className="wpnc-simplified__parent-text">{ repliedTo.text }</div>
				</ThreadItem>
			) }
			{ commenter && (
				<ThreadItem
					avatar={ commenter.avatar }
					author={ commenter.name }
					authorUrl={ commenter.url }
					meta={ meta }
					status={ status }
				>
					{ children }
				</ThreadItem>
			) }
		</VStack>
	);
}
