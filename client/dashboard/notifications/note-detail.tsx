import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft, chevronLeft, chevronRight, Icon } from '@wordpress/icons';
import { Fragment, useEffect, useState } from 'react';
import { Card, CardBody } from '../components/card';
import { getRelativeTimeString } from '../utils/datetime';
import { openNote, setFollowStatus, useNote } from './engine';
import {
	getBlockSegments,
	getNoteBodyParts,
	getNoteExcerpt,
	getNoteTypeLabel,
	getTitleSegments,
	getNoteUserRef,
} from './fields';
import NoteActions from './note-actions';
import { FALLBACK_NOTICON_ICON, NOTICON_ICONS } from './note-icons';
import type { Note } from './engine';
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

function UserRow( { note, block }: { note: Note; block: NoteBlock } ) {
	const user = getNoteUserRef( block );
	const [ isFollowing, setIsFollowing ] = useState( user.isFollowing );
	const [ isBusy, setIsBusy ] = useState( false );

	const toggleFollow = async () => {
		if ( user.siteId === null || isBusy ) {
			return;
		}
		setIsBusy( true );
		const previous = isFollowing;
		setIsFollowing( ! previous );
		try {
			setIsFollowing( await setFollowStatus( note, user.siteId, ! previous ) );
		} catch {
			setIsFollowing( previous );
		} finally {
			setIsBusy( false );
		}
	};

	const avatar = user.avatarUrl ? (
		<img src={ user.avatarUrl } alt="" width={ 32 } height={ 32 } />
	) : (
		<span aria-hidden="true">{ user.name.charAt( 0 ).toUpperCase() }</span>
	);

	const name = <Text weight={ 600 }>{ user.name }</Text>;

	return (
		<HStack
			className="dashboard-notifications-inbox__user-row"
			spacing={ 3 }
			justify="space-between"
			alignment="center"
		>
			<HStack spacing={ 3 } justify="flex-start" alignment="center">
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
					{ user.homeTitle && <Text variant="muted">{ user.homeTitle }</Text> }
				</VStack>
			</HStack>
			{ user.canFollow && (
				<Button
					variant="secondary"
					size="small"
					isPressed={ isFollowing }
					isBusy={ isBusy }
					onClick={ toggleFollow }
				>
					{ isFollowing ? __( 'Subscribed' ) : __( 'Subscribe' ) }
				</Button>
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
	const excerpt = getNoteExcerpt( note );
	const { context, comment, postscript } = getNoteBodyParts( note );
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
					{ title }
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
				{ userBlocks.length > 0 && (
					<VStack spacing={ 0 } className="dashboard-notifications-inbox__user-list">
						{ userBlocks.map( ( block, index ) => (
							<UserRow key={ index } note={ note } block={ block } />
						) ) }
					</VStack>
				) }
				{ comment && (
					<blockquote className="dashboard-notifications-inbox__quote">
						<Text as="p">
							<BlockText block={ comment } />
						</Text>
					</blockquote>
				) }
				{ postscript.map( ( block, index ) => (
					<Text key={ index } variant="muted">
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
