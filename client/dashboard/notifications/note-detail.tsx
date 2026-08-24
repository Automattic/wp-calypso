import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { Card, CardBody } from '../components/card';
import { getRelativeTimeString } from '../utils/datetime';
import { openNote, useNote } from './engine';
import { getNoteExcerpt, getNoteTitle } from './fields';

// The engine has no error signal for a missing note: `openNote` just keeps
// waiting for it to land in the store. Fall back to an empty state after this
// long rather than spinning forever on a deleted or invalid note.
const NOT_FOUND_TIMEOUT_MS = 10000;

function DetailFrame( { onClose, children }: { onClose: () => void; children: React.ReactNode } ) {
	return (
		<Card className="dashboard-notifications-inbox__detail">
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack justify="flex-end">
						<Button icon={ closeSmall } label={ __( 'Close notification' ) } onClick={ onClose } />
					</HStack>
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
	const bodyParagraphs = ( note.body ?? [] )
		.map( ( block ) => block.text )
		.filter( ( text ) => text && text.trim() );

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
					<Text weight={ 600 }>{ getNoteTitle( note ) }</Text>
					<Text variant="muted">{ getRelativeTimeString( new Date( note.timestamp ) ) }</Text>
				</VStack>
			</HStack>
			{ excerpt && <Text>{ excerpt }</Text> }
			{ bodyParagraphs.map( ( text, index ) => (
				<Text as="p" key={ index }>
					{ text }
				</Text>
			) ) }
			{ note.url && (
				<HStack justify="flex-start">
					<Button variant="secondary" href={ note.url } target="_blank" rel="noreferrer">
						{ __( 'Open on WordPress.com' ) }
					</Button>
				</HStack>
			) }
		</DetailFrame>
	);
}
