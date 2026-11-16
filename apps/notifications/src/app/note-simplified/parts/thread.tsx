import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	VisuallyHidden,
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

/**
 * Removes the text a comment quotes, so a short preview shows the author's own words.
 * A comment that is only quotes is kept whole.
 */
function withoutQuotes( block: Block ): Block {
	const quotes = block.ranges?.filter( ( range ) => range.type === 'blockquote' );
	if ( ! quotes?.length ) {
		return block;
	}

	const isQuoted: boolean[] = new Array( block.text.length ).fill( false );
	for ( const { indices } of quotes ) {
		const [ start, end ] = indices;
		isQuoted.fill( true, start, block.text[ end ] === '\n' ? end + 1 : end );
	}

	const text = block.text
		.split( '' )
		.filter( ( _, index ) => ! isQuoted[ index ] )
		.join( '' );
	if ( ! text.trim() ) {
		return block;
	}

	// The number of characters kept before each index, which is where that index moves to.
	const keptBefore = [ 0 ];
	isQuoted.forEach( ( quoted, index ) =>
		keptBefore.push( keptBefore[ index ] + ( quoted ? 0 : 1 ) )
	);

	const shiftIndices = < T extends { indices: [ number, number ] } >( items?: T[] ) =>
		items
			?.filter( ( { indices: [ start, end ] } ) =>
				end > start ? keptBefore[ end ] > keptBefore[ start ] : ! isQuoted[ start ]
			)
			.map( ( item ): T => ( {
				...item,
				indices: [ keptBefore[ item.indices[ 0 ] ], keptBefore[ item.indices[ 1 ] ] ],
			} ) );

	return {
		...block,
		text,
		ranges: shiftIndices( block.ranges ),
		media: shiftIndices( block.media ),
	};
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
	label,
	url,
	compact = false,
	className,
	children,
}: {
	avatar?: string | null;
	author?: string;
	authorUrl?: string | null;
	meta?: ReactNode;
	url?: string | null;
	status?: ReactNode;
	label?: string;
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
		<Text
			className="wpnc-simplified__author"
			size={ compact ? 13 : 14 }
			weight={ compact ? 500 : 600 }
			lineHeight="20px"
		>
			{ authorUrl ? (
				<a href={ authorUrl } target="_blank" rel="noreferrer">
					{ author }
				</a>
			) : (
				author
			) }
		</Text>
	);

	// The link to the comment, stretched over the whole panel for the pointer. The time's
	// link goes to the same comment, so this one stays out of the tab order and the
	// accessibility tree.
	const link = url && (
		<a
			className="wpnc-simplified__item-link"
			href={ url }
			target="_blank"
			rel="noreferrer"
			tabIndex={ -1 }
			aria-hidden="true"
		/>
	);

	return (
		<VStack as="li" className={ className } spacing={ compact ? 2 : 3 }>
			{ label && <VisuallyHidden>{ label }</VisuallyHidden> }
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
				{ link }
			</HStack>
			{ children }
		</VStack>
	);
};

export function ThreadParent( {
	comment,
	truncate = false,
	compact = false,
	label,
	maxLength,
}: {
	comment: NoteParentComment;
	truncate?: boolean;
	compact?: boolean;
	label?: string;
	maxLength?: number;
} ) {
	const fullContent = comment.content ?? { text: comment.text };
	const content = maxLength ? truncateBlock( fullContent, maxLength ) : fullContent;

	return (
		<ThreadItem
			className={ clsx( 'wpnc-simplified__thread-parent', { 'is-compact': compact } ) }
			avatar={ comment.author_avatar }
			author={ comment.author_name }
			authorUrl={ comment.author_url }
			url={ compact ? comment.url : undefined }
			compact={ compact }
			label={ label }
			meta={
				comment.date && (
					<Text className="wpnc-simplified__quiet-links" size={ 12 } variant="muted">
						<NoteTime timestamp={ comment.date } url={ comment.url } isComment={ compact } />
					</Text>
				)
			}
		>
			<div
				className={ clsx( 'wpnc-simplified__parent-text', {
					'is-truncated': truncate,
					'is-excerpt': maxLength,
				} ) }
			>
				{ p( html( truncate ? toPreview( withoutQuotes( content ) ) : content ) ) }
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
	children,
}: {
	spacing?: number;
	children: ReactNode;
} ) {
	return (
		<VStack as="ol" className="wpnc-simplified__thread" spacing={ spacing }>
			{ children }
		</VStack>
	);
}
