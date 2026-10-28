import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { html } from '../../../panel/indices-to-html';
import { p } from '../../../panel/templates/functions';
import NoteIcon from '../../note-icon';
import { NoteTime } from './note-meta';
import type { Block, NoteActor, NoteParentComment } from '../../types';
import type { ReactNode } from 'react';

/**
 * Flattens a block onto one line, for a clamped preview.
 */
function toPreview( block: Block ): Block {
	return { ...block, text: block.text.replace( /\n/g, ' ' ) };
}

const ThreadItem = ( {
	avatar,
	author,
	authorUrl,
	meta,
	status,
	className,
	children,
}: {
	avatar?: string | null;
	author?: string;
	authorUrl?: string | null;
	meta?: ReactNode;
	status?: ReactNode;
	className?: string;
	children: ReactNode;
} ) => {
	const photo = (
		<NoteIcon className="wpnc-simplified__photo" icon={ avatar ?? undefined } size={ 36 } />
	);
	const name = author && (
		<Text className="wpnc-simplified__author" size={ 15 } weight={ 600 }>
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
		<VStack as="li" className={ className } spacing={ 3 }>
			<HStack alignment="top" justify="flex-start" spacing={ 3 }>
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
				<VStack className="wpnc-simplified__quiet-links" spacing={ 0 } style={ { flex: 1 } }>
					{ name }
					{ meta }
				</VStack>
				{ status }
			</HStack>
			{ children }
		</VStack>
	);
};

export function ThreadParent( {
	comment,
	truncate = false,
}: {
	comment: NoteParentComment;
	truncate?: boolean;
} ) {
	const content = comment.content ?? { text: comment.text };

	return (
		<ThreadItem
			className="wpnc-simplified__thread-parent"
			avatar={ comment.author_avatar }
			author={ comment.author_name }
			authorUrl={ comment.author_url }
			meta={
				comment.date && (
					<Text className="wpnc-simplified__quiet-links" size={ 12 } variant="muted">
						<NoteTime timestamp={ comment.date } url={ comment.url } />
					</Text>
				)
			}
		>
			<div className={ clsx( 'wpnc-simplified__parent-text', { 'is-truncated': truncate } ) }>
				{ p( html( truncate ? toPreview( content ) : content ) ) }
			</div>
		</ThreadItem>
	);
}

export function ThreadReply( {
	commenter,
	meta,
	status,
	children,
}: {
	commenter: NoteActor;
	meta?: ReactNode;
	status?: ReactNode;
	children: ReactNode;
} ) {
	return (
		<ThreadItem
			avatar={ commenter.avatar }
			author={ commenter.name }
			authorUrl={ commenter.url }
			meta={ meta }
			status={ status }
		>
			{ children }
		</ThreadItem>
	);
}

export default function Thread( {
	spacing = 4,
	isReply = false,
	children,
}: {
	spacing?: number;
	isReply?: boolean;
	children: ReactNode;
} ) {
	return (
		<VStack
			as="ol"
			className={ clsx( 'wpnc-simplified__thread', { 'is-reply': isReply } ) }
			spacing={ spacing }
		>
			{ children }
		</VStack>
	);
}
