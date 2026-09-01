import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft, chevronLeft, chevronRight, external, Icon } from '@wordpress/icons';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody } from '../components/card';
import { openNote, useNote } from './engine';
import { getNoticonIcon } from './note-icons';
import { getNoteView } from './note-model';
import NoteViewSwitch from './note-views';
import { TitleText } from './rich-text';
import type { Note } from './engine';

// The engine has no error signal for a missing note: `openNote` just keeps
// waiting for it to land in the store. Fall back to an empty state after this
// long rather than spinning forever on a deleted or invalid note.
const NOT_FOUND_TIMEOUT_MS = 10000;

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

function DetailNav( {
	note,
	typeLabel,
	context,
	onPrevious,
	onNext,
}: {
	note: Note;
	typeLabel: string;
	context?: React.ReactNode;
	onPrevious?: ( () => void ) | null;
	onNext?: ( () => void ) | null;
} ) {
	return (
		<HStack
			spacing={ 2 }
			justify="flex-start"
			alignment="center"
			className="dashboard-notifications-inbox__detail-nav"
		>
			<span className="dashboard-notifications-inbox__type-chip" aria-hidden="true">
				<Icon icon={ getNoticonIcon( note.noticon ) } size={ 16 } />
			</span>
			<Text weight={ 500 }>{ typeLabel }</Text>
			{ context }
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
	const view = useMemo( () => ( note ? getNoteView( note ) : null ), [ note ] );

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

	if ( ! note || ! view ) {
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

	// A thread is headed by where the parent comment sits.
	const context = view.kind === 'thread' && <TitleText segments={ view.parent.post } />;

	return (
		<DetailFrame onClose={ onClose }>
			<DetailNav
				note={ note }
				typeLabel={ view.typeLabel }
				context={ context }
				onPrevious={ onPrevious }
				onNext={ onNext }
			/>
			<NoteViewSwitch view={ view } />
		</DetailFrame>
	);
}
