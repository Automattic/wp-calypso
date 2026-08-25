import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { Card, CardBody } from '../components/card';
import { getRelativeTimeString } from '../utils/datetime';
import { openNote, useNote } from './engine';
import { getBlockSegments, getNoteBodyParts, getNoteExcerpt, getNoteTitle } from './fields';
import NoteActions from './note-actions';
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

export default function NoteDetail( { noteId, onClose }: { noteId: string; onClose: () => void } ) {
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

	return (
		<DetailFrame onClose={ onClose }>
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
				{ context.map( ( block, index ) => (
					<Text key={ index } variant="muted">
						<BlockText block={ block } />
					</Text>
				) ) }
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
