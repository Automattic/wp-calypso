import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';
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

/**
 * Shortens a block to at most `maxLength` characters at a word boundary, ending it with an ellipsis.
 */
function truncateBlock( block: Block, maxLength: number ): Block {
	if ( block.text.length <= maxLength ) {
		return block;
	}

	const lastSpace = block.text.lastIndexOf( ' ', maxLength );
	const cutAtSpace = lastSpace > maxLength * 0.7;
	const keptLength = block.text.slice( 0, cutAtSpace ? lastSpace : maxLength ).trimEnd().length;
	const clampIndices = < T extends { indices: [ number, number ] } >( items?: T[] ) =>
		items
			?.filter( ( item ) => item.indices[ 0 ] < keptLength )
			.map( ( item ): T => ( {
				...item,
				indices: [
					item.indices[ 0 ],
					item.indices[ 1 ] > keptLength ? keptLength + 1 : item.indices[ 1 ],
				],
			} ) );

	return {
		...block,
		text: block.text.slice( 0, keptLength ) + '…',
		ranges: clampIndices( block.ranges ),
		media: clampIndices( block.media ),
	};
}

const ThreadItem = ( {
	avatar,
	author,
	authorUrl,
	meta,
	status,
	compact = false,
	className,
	children,
}: {
	avatar?: string | null;
	author?: string;
	authorUrl?: string | null;
	meta?: ReactNode;
	status?: ReactNode;
	compact?: boolean;
	className?: string;
	children: ReactNode;
} ) => {
	const photo = (
		<NoteIcon
			className="wpnc-simplified__photo"
			icon={ avatar ?? undefined }
			size={ compact ? 16 : 36 }
		/>
	);
	const name = author && (
		<Text className="wpnc-simplified__author" size={ compact ? 13 : 15 } weight={ 600 }>
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
		<VStack as="li" className={ className } spacing={ compact ? 2 : 3 }>
			<HStack
				alignment={ compact ? 'center' : 'top' }
				justify="flex-start"
				spacing={ compact ? 2 : 3 }
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
				{ /* A compact item, the comment a reply answers, keeps its name and time on one line. */ }
				<HStack
					className="wpnc-simplified__quiet-links"
					direction={ compact ? 'row' : 'column' }
					alignment={ compact ? 'baseline' : 'topLeft' }
					justify="flex-start"
					spacing={ compact ? 2 : 0 }
					style={ { flex: 1 } }
				>
					{ name }
					{ meta }
				</HStack>
				{ status }
			</HStack>
			{ children }
		</VStack>
	);
};

export function ThreadParent( {
	comment,
	truncate = false,
	compact = false,
	maxLength,
}: {
	comment: NoteParentComment;
	truncate?: boolean;
	compact?: boolean;
	maxLength?: number;
} ) {
	const fullContent = comment.content ?? { text: comment.text };
	const content = maxLength ? truncateBlock( fullContent, maxLength ) : fullContent;
	const textId = useId();
	const textRef = useRef< HTMLDivElement >( null );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ isClamped, setIsClamped ] = useState( false );
	// Only the full `content` has more to show; `text` is already a short excerpt.
	const canExpand = truncate && !! comment.content;
	const isTruncated = truncate && ! isExpanded;

	// Offer Show more only when the clamp actually hides text, rechecking as the pane resizes.
	useEffect( () => {
		const text = textRef.current;
		if ( ! canExpand || isExpanded || ! text ) {
			return;
		}
		const measure = () => setIsClamped( text.scrollHeight > text.clientHeight );
		measure();
		const observer = new ResizeObserver( measure );
		observer.observe( text );
		return () => observer.disconnect();
	}, [ canExpand, isExpanded ] );

	return (
		<ThreadItem
			className="wpnc-simplified__thread-parent"
			avatar={ comment.author_avatar }
			author={ comment.author_name }
			authorUrl={ comment.author_url }
			compact={ compact }
			meta={
				comment.date && (
					<Text className="wpnc-simplified__quiet-links" size={ 12 } variant="muted">
						<NoteTime timestamp={ comment.date } url={ comment.url } />
					</Text>
				)
			}
		>
			<div
				ref={ textRef }
				id={ textId }
				className={ clsx( 'wpnc-simplified__parent-text', {
					'is-truncated': isTruncated,
					'is-excerpt': maxLength || isExpanded,
				} ) }
			>
				{ p( html( isTruncated ? toPreview( content ) : content ) ) }
			</div>
			{ canExpand && ( isClamped || isExpanded ) && (
				<Button
					className="wpnc-simplified__show-more"
					variant="link"
					aria-expanded={ isExpanded }
					aria-controls={ textId }
					onClick={ () => setIsExpanded( ! isExpanded ) }
				>
					{ isExpanded ? __( 'Show less' ) : __( 'Show more' ) }
				</Button>
			) }
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
