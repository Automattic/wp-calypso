import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft, chevronLeft, chevronRight, Icon } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { Card, CardBody } from '../components/card';
import { getRelativeTimeString } from '../utils/datetime';
import { openNote, useNote } from './engine';
import {
	getBlockSegments,
	getNoteBodyParts,
	getNoteExcerpt,
	getNoteTitle,
	getNoteTypeLabel,
	getNoteUserRef,
} from './fields';
import NoteActions from './note-actions';
import { FALLBACK_NOTICON_ICON, NOTICON_ICONS } from './note-icons';
import type { NoteBlock } from './fields';

// The engine has no error signal for a missing note: `openNote` just keeps
// waiting for it to land in the store. Fall back to an empty state after this
// long rather than spinning forever on a deleted or invalid note.
const NOT_FOUND_TIMEOUT_MS = 10000;

function BlockText( { block }: { block: NoteBlock } ) {
	return (
		<>
			{ getBlockSegments( block ).map( ( segment, index ) =>
				segment.url ? (
					<a key={ index } href={ segment.url } target="_blank" rel="noreferrer">
						{ segment.text }
					</a>
				) : (
					segment.text
				)
			) }
		</>
	);
}

const FACEPILE_MAX = 3;

function Facepile( { blocks }: { blocks: NoteBlock[] } ) {
	const users = blocks.map( getNoteUserRef );
	const shown = users.slice( 0, FACEPILE_MAX );
	const extra = users.length - shown.length;

	return (
		<HStack
			className="dashboard-notifications-inbox__facepile"
			justify="flex-start"
			spacing={ 0 }
			alignment="center"
		>
			{ shown.map( ( user, index ) => {
				const avatar = user.avatarUrl ? (
					<img src={ user.avatarUrl } alt="" width={ 28 } height={ 28 } />
				) : (
					<span aria-hidden="true">{ user.name.charAt( 0 ).toUpperCase() }</span>
				);
				return user.url ? (
					<a
						key={ index }
						className="dashboard-notifications-inbox__facepile-item"
						href={ user.url }
						target="_blank"
						rel="noreferrer"
						title={ user.name }
						aria-label={ user.name }
					>
						{ avatar }
					</a>
				) : (
					<span
						key={ index }
						className="dashboard-notifications-inbox__facepile-item"
						title={ user.name }
					>
						{ avatar }
					</span>
				);
			} ) }
			{ extra > 0 && (
				<span className="dashboard-notifications-inbox__facepile-item is-overflow">+{ extra }</span>
			) }
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

	const excerpt = getNoteExcerpt( note );
	const { context, comment } = getNoteBodyParts( note );
	const userBlocks = context.filter( ( block ) => block.type === 'user' );
	const otherContext = context.filter( ( block ) => block.type !== 'user' );

	return (
		<DetailFrame onClose={ onClose }>
			<HStack
				spacing={ 2 }
				justify="flex-start"
				alignment="center"
				className="dashboard-notifications-inbox__detail-nav"
			>
				<span className="dashboard-notifications-inbox__type-chip" aria-hidden="true">
					<Icon icon={ NOTICON_ICONS[ note.noticon ] ?? FALLBACK_NOTICON_ICON } size={ 16 } />
				</span>
				<Text weight={ 500 }>{ getNoteTypeLabel( note ) }</Text>
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
			<HStack spacing={ 3 } justify="flex-start" alignment="center">
				<img
					className="dashboard-notifications-inbox__note-avatar"
					src={ note.icon }
					alt=""
					width={ 40 }
					height={ 40 }
				/>
				<VStack spacing={ 0 }>
					{ note.url ? (
						<ExternalLink
							className="dashboard-notifications-inbox__note-title-link"
							href={ note.url }
							aria-label={ __( 'Open on WordPress.com' ) }
						>
							<Text weight={ 600 }>{ getNoteTitle( note ) }</Text>
						</ExternalLink>
					) : (
						<Text weight={ 600 }>{ getNoteTitle( note ) }</Text>
					) }
					<Text variant="muted">{ getRelativeTimeString( new Date( note.timestamp ) ) }</Text>
				</VStack>
			</HStack>
			<VStack spacing={ 3 } className="dashboard-notifications-inbox__body">
				{ ! comment && excerpt && <Text>{ excerpt }</Text> }
				{ otherContext.map( ( block, index ) => (
					<Text key={ index } variant="muted">
						<BlockText block={ block } />
					</Text>
				) ) }
				{ userBlocks.length > 0 && <Facepile blocks={ userBlocks } /> }
				{ comment && (
					<blockquote className="dashboard-notifications-inbox__quote">
						<Text as="p">
							<BlockText block={ comment } />
						</Text>
					</blockquote>
				) }
			</VStack>
			<div className="dashboard-notifications-inbox__footer">
				<NoteActions key={ note.id } note={ note } />
			</div>
		</DetailFrame>
	);
}
