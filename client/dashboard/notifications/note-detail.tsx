import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Spinner,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { arrowLeft, chevronLeft, chevronRight, Icon } from '@wordpress/icons';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody } from '../components/card';
import { openNote, useNote } from './engine';
import { getNoticonIcon } from './note-icons';
import { getNoteView } from './note-model';
import NoteViewSwitch from './note-views';
import type { Note } from './engine';
import type { NoteView, TitleSegment } from './note-model';

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
	heading,
	onPrevious,
	onNext,
}: {
	note: Note;
	heading: React.ReactNode;
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
			{ heading }
			<HStack
				spacing={ 1 }
				expanded={ false }
				className="dashboard-notifications-inbox__detail-nav-actions"
			>
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

function getPostLink( view: NoteView ): TitleSegment | null {
	switch ( view.kind ) {
		case 'thread':
			return view.parent.postLink;
		case 'comment':
			return view.postLink;
		default:
			return null;
	}
}

// Comments are headed by their type and the post, as one sentence, leaving the
// author line to the name and time.
function Heading( { view }: { view: NoteView } ) {
	const post = getPostLink( view );
	if ( ! post ) {
		return <Text weight={ 500 }>{ view.typeLabel }</Text>;
	}
	const postNode = post.url ? (
		<a href={ post.url } target="_blank" rel="noreferrer">
			{ post.text }
		</a>
	) : (
		<span>{ post.text }</span>
	);
	return (
		<Text className="dashboard-notifications-inbox__note-title">
			{ createInterpolateElement(
				/* translators: <label/> is the notification type (Comment, Mention); <post/> is the post title. */
				__( '<label /> on <post />' ),
				{ label: <strong>{ view.typeLabel }</strong>, post: postNode }
			) }
		</Text>
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

	const heading = <Heading view={ view } />;

	return (
		<DetailFrame onClose={ onClose }>
			<DetailNav note={ note } heading={ heading } onPrevious={ onPrevious } onNext={ onNext } />
			<NoteViewSwitch view={ view } />
		</DetailFrame>
	);
}
