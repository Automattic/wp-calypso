import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import RouterLinkButton from '../components/router-link-button';
import { getRelativeTimeString } from '../utils/datetime';
import { NotesProvider, acquireEngineVisibility, openNote, useNote } from './engine';
import { getNoteExcerpt, getNoteTitle } from './fields';

import './style.scss';

// The engine has no error signal for a missing note: `openNote` just keeps
// waiting for it to land in the store. Fall back to an empty state after this
// long rather than spinning forever on a deleted or invalid note.
const NOT_FOUND_TIMEOUT_MS = 10000;

function BackButton() {
	return (
		<HStack justify="flex-start">
			<RouterLinkButton to="/notifications" icon={ chevronLeft } variant="tertiary">
				{ __( 'All notifications' ) }
			</RouterLinkButton>
		</HStack>
	);
}

function NoteDetail( { noteId }: { noteId: string } ) {
	const note = useNote( noteId );
	const [ timedOut, setTimedOut ] = useState( false );

	useEffect( () => acquireEngineVisibility(), [] );

	// Selecting the note marks it read; if it isn't loaded yet (deep link,
	// hard reload), the engine fetches it first and selects once it lands.
	useEffect( () => openNote( noteId ), [ noteId ] );

	useEffect( () => {
		if ( note ) {
			return;
		}
		const timer = setTimeout( () => setTimedOut( true ), NOT_FOUND_TIMEOUT_MS );
		return () => clearTimeout( timer );
	}, [ note ] );

	if ( ! note ) {
		return (
			<PageLayout
				size="small"
				header={
					<VStack spacing={ 4 }>
						<BackButton />
						<PageHeader title={ __( 'Notification' ) } />
					</VStack>
				}
			>
				<VStack alignment="center" style={ { padding: '40px 0' } }>
					{ timedOut ? (
						<Text>{ __( 'This notification is no longer available.' ) }</Text>
					) : (
						<Spinner />
					) }
				</VStack>
			</PageLayout>
		);
	}

	const excerpt = getNoteExcerpt( note );
	const bodyParagraphs = ( note.body ?? [] )
		.map( ( block ) => block.text )
		.filter( ( text ) => text && text.trim() );

	return (
		<PageLayout
			size="small"
			header={
				<VStack spacing={ 4 }>
					<BackButton />
					<PageHeader
						title={ getNoteTitle( note ) }
						actions={
							note.url ? (
								<Button
									variant="secondary"
									href={ note.url }
									target="_blank"
									rel="noreferrer"
									__next40pxDefaultSize
								>
									{ __( 'Open on WordPress.com' ) }
								</Button>
							) : undefined
						}
					/>
				</VStack>
			}
		>
			<VStack spacing={ 4 }>
				<HStack spacing={ 3 } justify="flex-start" alignment="center">
					<img
						className="dashboard-notifications-inbox__note-avatar"
						src={ note.icon }
						alt=""
						width={ 40 }
						height={ 40 }
					/>
					<VStack spacing={ 0 }>
						{ excerpt && <Text>{ excerpt }</Text> }
						<Text variant="muted">{ getRelativeTimeString( new Date( note.timestamp ) ) }</Text>
					</VStack>
				</HStack>
				{ bodyParagraphs.map( ( text, index ) => (
					<Text as="p" key={ index }>
						{ text }
					</Text>
				) ) }
			</VStack>
		</PageLayout>
	);
}

export default function NotificationsInboxNote( { noteId }: { noteId: string } ) {
	return (
		<NotesProvider>
			<NoteDetail noteId={ noteId } />
		</NotesProvider>
	);
}
