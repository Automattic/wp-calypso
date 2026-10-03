import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import NoteIcon from '../note-icon';
import type { NoteView } from './note-view';
import type { ReactNode } from 'react';

const ThreadItem = ( {
	avatar,
	author,
	authorUrl,
	meta,
	children,
}: {
	avatar?: string;
	author?: string;
	authorUrl?: string;
	meta?: ReactNode;
	children: ReactNode;
} ) => {
	const photo = <NoteIcon icon={ avatar } size={ 32 } />;
	const name = author && (
		<Text weight={ 600 }>
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
			spacing={ 4 }
		>
			{ authorUrl ? (
				// The name beside it links to the same profile, so the photo stays out of the tab order.
				<a href={ authorUrl } target="_blank" rel="noreferrer" tabIndex={ -1 } aria-hidden="true">
					{ photo }
				</a>
			) : (
				photo
			) }
			<VStack className="wpnc-simplified__thread-content" spacing={ 1 }>
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
	thread: { parent, speaker },
	meta,
	parentMeta,
	children,
}: {
	thread: NonNullable< NoteView[ 'thread' ] >;
	/** When the new comment was made, and anything else worth knowing about its author. */
	meta: ReactNode;
	parentMeta?: ReactNode;
	children: ReactNode;
} ) {
	return (
		<VStack as="ol" className="wpnc-simplified__thread" spacing={ 0 }>
			{ parent && (
				<ThreadItem
					avatar={ parent.avatar }
					author={ parent.author }
					authorUrl={ parent.authorUrl }
					meta={ parentMeta }
				>
					<a
						className="wpnc-simplified__quiet-links"
						href={ parent.url }
						target="_blank"
						rel="noreferrer"
					>
						{ parent.text }
					</a>
				</ThreadItem>
			) }
			{ speaker && (
				<ThreadItem
					avatar={ speaker.avatar }
					author={ speaker.name }
					authorUrl={ speaker.url }
					meta={ meta }
				>
					{ children }
				</ThreadItem>
			) }
		</VStack>
	);
}
