import { getRichNodes } from '@automattic/notifications/src/common/rich-text';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft, chevronLeft, chevronRight, external, Icon } from '@wordpress/icons';
import { Fragment, useEffect, useState } from 'react';
import { Card, CardBody } from '../components/card';
import { getRelativeTimeString } from '../utils/datetime';
import { openNote, useNote } from './engine';
import {
	getNoteBodyParts,
	getNoteParentComment,
	getNoteExcerpt,
	getNoteTypeLabel,
	getTitleSegments,
	getNoteUserRef,
} from './fields';
import NoteActions from './note-actions';
import { getNoticonIcon } from './note-icons';
import type { Note } from './engine';
import type { NoteBlock } from './fields';
import type { RichNode } from '@automattic/notifications/src/common/rich-text';

// The engine has no error signal for a missing note: `openNote` just keeps
// waiting for it to land in the store. Fall back to an empty state after this
// long rather than spinning forever on a deleted or invalid note.
const NOT_FOUND_TIMEOUT_MS = 10000;

const RICH_TAGS: Partial< Record< string, keyof React.JSX.IntrinsicElements > > = {
	b: 'strong',
	strong: 'strong',
	i: 'em',
	em: 'em',
	blockquote: 'blockquote',
	cite: 'cite',
	code: 'code',
	pre: 'pre',
	p: 'p',
	div: 'div',
	span: 'span',
	sub: 'sub',
	sup: 'sup',
	del: 'del',
	s: 's',
	ol: 'ol',
	ul: 'ul',
	li: 'li',
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
	figure: 'figure',
	figcaption: 'figcaption',
	br: 'br',
	hr: 'hr',
};

function RichNodeView( { node }: { node: RichNode } ) {
	switch ( node.kind ) {
		case 'text':
			return <>{ node.text }</>;
		case 'icon':
			return <Icon icon={ getNoticonIcon( node.value ) } size={ 16 } />;
		case 'image':
			return (
				<img
					className={
						node.imageType === 'badge'
							? 'dashboard-notifications-inbox__badge-media'
							: 'dashboard-notifications-inbox__body-image'
					}
					src={ node.url }
					alt={ node.alt }
				/>
			);
		case 'element': {
			const children = node.children.map( ( child, index ) => (
				<RichNodeView key={ index } node={ child } />
			) );
			if ( node.type === 'button' && node.url ) {
				return (
					<Button variant="primary" href={ node.url } target="_blank" rel="noreferrer">
						{ children }
					</Button>
				);
			}
			if ( node.url ) {
				return (
					<a href={ node.url } target="_blank" rel="noreferrer">
						{ children }
					</a>
				);
			}
			const Tag = RICH_TAGS[ node.type ];
			if ( Tag === 'br' || Tag === 'hr' ) {
				return <Tag />;
			}
			if ( Tag ) {
				return <Tag>{ children }</Tag>;
			}
			return <>{ children }</>;
		}
	}
}

function BlockText( { block }: { block: NoteBlock } ) {
	return (
		<>
			{ getRichNodes( block ).map( ( node, index ) => (
				<RichNodeView key={ index } node={ node } />
			) ) }
		</>
	);
}

function UserRow( { note, block }: { note: Note; block: NoteBlock } ) {
	const user = getNoteUserRef( block );

	const avatar = user.avatarUrl ? (
		<img src={ user.avatarUrl } alt="" width={ 32 } height={ 32 } />
	) : (
		<span aria-hidden="true">{ user.name.charAt( 0 ).toUpperCase() }</span>
	);

	const name = <Text weight={ 600 }>{ user.name }</Text>;

	const blog =
		user.homeTitle && user.homeUrl ? (
			<a
				className="dashboard-notifications-inbox__user-row-name"
				href={ user.homeUrl }
				target="_blank"
				rel="noreferrer"
			>
				{ user.homeTitle }
			</a>
		) : (
			user.homeTitle || null
		);

	return (
		<HStack
			className="dashboard-notifications-inbox__user-row"
			spacing={ 3 }
			justify="flex-start"
			alignment="center"
		>
			<span className="dashboard-notifications-inbox__user-row-avatar">{ avatar }</span>
			<VStack spacing={ 0 }>
				{ user.url ? (
					<a
						className="dashboard-notifications-inbox__user-row-name"
						href={ user.url }
						target="_blank"
						rel="noreferrer"
					>
						{ name }
					</a>
				) : (
					name
				) }
				{ note.type === 'comment' ? (
					<Text variant="muted">
						{ getRelativeTimeString( new Date( note.timestamp ) ) }
						{ blog && (
							<>
								{ ' · ' }
								{ blog }
							</>
						) }
					</Text>
				) : (
					blog && <Text variant="muted">{ blog }</Text>
				) }
			</VStack>
		</HStack>
	);
}

function DetailFrame( { onClose, children }: { onClose: () => void; children: React.ReactNode } ) {
	return (
		<Card className="dashboard-notifications-inbox__detail">
			<CardBody>
				<VStack spacing={ 4 }>
					<Button
						className="dashboard-notifications-inbox__back"
						icon={ arrowLeft }
						onClick={ onClose }
					>
						{ __( 'Back to list' ) }
					</Button>
					{ children }
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function NoteDetail( {
	noteId,
	onClose,
	onPrevious,
	onNext,
}: {
	noteId: string;
	onClose: () => void;
	onPrevious?: ( () => void ) | null;
	onNext?: ( () => void ) | null;
} ) {
	const note = useNote( noteId );
	const [ timedOut, setTimedOut ] = useState( false );

	// Selecting the note marks it read; if it isn't loaded yet (deep link,
	// hard reload), the engine fetches it first and selects once it lands.
	useEffect( () => openNote( noteId ), [ noteId ] );

	useEffect( () => {
		if ( note ) {
			return;
		}
		setTimedOut( false );
		const timer = setTimeout( () => setTimedOut( true ), NOT_FOUND_TIMEOUT_MS );
		return () => clearTimeout( timer );
	}, [ note, noteId ] );

	if ( ! note ) {
		return (
			<DetailFrame onClose={ onClose }>
				<VStack alignment="center" style={ { padding: '40px 0' } }>
					{ timedOut ? (
						<Text>{ __( 'This notification is no longer available.' ) }</Text>
					) : (
						<Spinner />
					) }
				</VStack>
			</DetailFrame>
		);
	}

	const title = (
		<Text className="dashboard-notifications-inbox__note-title">
			{ getTitleSegments( note ).map( ( segment, index ) => {
				const text = segment.bold ? <strong>{ segment.text }</strong> : segment.text;
				return segment.url ? (
					<a key={ index } href={ segment.url } target="_blank" rel="noreferrer">
						{ text }
					</a>
				) : (
					<Fragment key={ index }>{ text }</Fragment>
				);
			} ) }
		</Text>
	);
	// Like notes reiterate the subject in their liker rows; the top section
	// shows what was liked instead (the header: author, then the post or
	// comment linked to the note target), like the legacy panel.
	const headerBlocks =
		note.type === 'like' || note.type === 'comment_like' ? note.header ?? [] : [];
	const headerUser = headerBlocks.length > 0 ? getNoteUserRef( headerBlocks[ 0 ] ) : null;
	const headerSnippet = headerBlocks[ 1 ]?.text ?? null;

	const badgeMedia = ( note.body ?? [] )
		.flatMap( ( block ) => block.media ?? [] )
		.filter( ( media ) => media.type === 'badge' );

	const excerpt = getNoteExcerpt( note );
	const { context, comment, postscript } = getNoteBodyParts( note );
	const parentComment = getNoteParentComment( note );

	// Blocks render in payload order, like the legacy panel; consecutive user
	// blocks fold into one list.
	const contextRuns: Array< { users: NoteBlock[] } | { block: NoteBlock } > = [];
	for ( const block of context ) {
		const last = contextRuns[ contextRuns.length - 1 ];
		if ( block.type === 'user' ) {
			if ( last && 'users' in last ) {
				last.users.push( block );
			} else {
				contextRuns.push( { users: [ block ] } );
			}
		} else {
			contextRuns.push( { block } );
		}
	}

	return (
		<DetailFrame onClose={ onClose }>
			<HStack
				spacing={ 2 }
				justify="flex-start"
				alignment="center"
				className="dashboard-notifications-inbox__detail-nav"
			>
				<span className="dashboard-notifications-inbox__type-chip" aria-hidden="true">
					<Icon icon={ getNoticonIcon( note.noticon ) } size={ 16 } />
				</span>
				<Text weight={ 500 }>{ getNoteTypeLabel( note ) }</Text>
				<HStack
					spacing={ 1 }
					expanded={ false }
					className="dashboard-notifications-inbox__detail-nav-actions"
				>
					{ note.url && (
						<Button
							size="small"
							icon={ external }
							label={ __( 'Open on site' ) }
							href={ note.url }
							target="_blank"
							rel="noreferrer"
						/>
					) }
					<Button
						size="small"
						icon={ chevronLeft }
						label={ __( 'Previous notification' ) }
						onClick={ onPrevious ?? undefined }
						disabled={ ! onPrevious }
					/>
					<Button
						size="small"
						icon={ chevronRight }
						label={ __( 'Next notification' ) }
						onClick={ onNext ?? undefined }
						disabled={ ! onNext }
					/>
				</HStack>
			</HStack>
			<HStack spacing={ 3 } justify="flex-start" alignment="center">
				{ badgeMedia.length === 0 && (
					<img
						className="dashboard-notifications-inbox__note-avatar"
						src={ parentComment?.avatarUrl ?? headerUser?.avatarUrl ?? note.icon }
						alt=""
						width={ 40 }
						height={ 40 }
					/>
				) }
				<VStack spacing={ 0 }>
					{ parentComment && (
						<>
							<Text>
								<BlockText block={ parentComment.author } />
							</Text>
							<Text className="dashboard-notifications-inbox__note-title">
								{ parentComment.excerpt.text }
							</Text>
						</>
					) }
					{ ! parentComment &&
						( headerUser ? (
							<>
								{ headerUser.url ? (
									<a
										className="dashboard-notifications-inbox__user-row-name"
										href={ headerUser.url }
										target="_blank"
										rel="noreferrer"
									>
										<Text weight={ 600 }>{ headerUser.name }</Text>
									</a>
								) : (
									<Text weight={ 600 }>{ headerUser.name }</Text>
								) }
								{ headerSnippet && (
									<Text className="dashboard-notifications-inbox__note-title">
										<a href={ note.url } target="_blank" rel="noreferrer">
											{ headerSnippet }
										</a>
									</Text>
								) }
							</>
						) : (
							title
						) ) }
					{ ! parentComment &&
						( note.url ? (
							<a
								className="dashboard-notifications-inbox__note-time"
								href={ note.url }
								target="_blank"
								rel="noreferrer"
							>
								<Text variant="muted">{ getRelativeTimeString( new Date( note.timestamp ) ) }</Text>
							</a>
						) : (
							<Text variant="muted">{ getRelativeTimeString( new Date( note.timestamp ) ) }</Text>
						) ) }
				</VStack>
			</HStack>
			<VStack spacing={ 3 } className="dashboard-notifications-inbox__body">
				{ ! comment && excerpt && <Text>{ excerpt }</Text> }
				{ contextRuns.map( ( run, index ) =>
					'users' in run ? (
						<VStack
							key={ index }
							spacing={ 0 }
							className="dashboard-notifications-inbox__user-list"
						>
							{ run.users.map( ( block, userIndex ) => (
								<UserRow key={ userIndex } note={ note } block={ block } />
							) ) }
						</VStack>
					) : (
						<Text
							key={ index }
							variant="muted"
							className="dashboard-notifications-inbox__block-text"
						>
							<BlockText block={ run.block } />
						</Text>
					)
				) }
				{ comment && (
					<blockquote className="dashboard-notifications-inbox__quote">
						<Text as="p">
							<BlockText block={ comment } />
						</Text>
					</blockquote>
				) }
				{ postscript.map( ( block, index ) => (
					<Text key={ index } variant="muted" className="dashboard-notifications-inbox__block-text">
						<BlockText block={ block } />
					</Text>
				) ) }
			</VStack>
			<div className="dashboard-notifications-inbox__footer">
				<NoteActions key={ note.id } note={ note } />
			</div>
		</DetailFrame>
	);
}
