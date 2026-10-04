import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getIsNotePendingApproval from '../../panel/state/selectors/get-is-note-pending-approval';
import { NoteBody } from '../templates/body';
import ActorRow, { NoteMeta, NoteTime } from './actor-row';
import { getNoteView } from './note-view';
import { ContextCard, PostCard } from './preview';
import Thread from './thread';
import type { Note } from '../types';
import './style.scss';

/**
 * The open note, led by whatever it concerns: a card for the post or site, the
 * conversation when someone is speaking, then the note's own body.
 */
export default function SimplifiedNote( { note, className }: { note: Note; className: string } ) {
	const isPendingApproval = useSelector( ( state ) => getIsNotePendingApproval( state, note ) );
	const view = useMemo( () => getNoteView( note, isPendingApproval ), [ note, isPendingApproval ] );
	const { thread, origin } = view;
	const parentDate = note.parent_comment?.date;

	// The thread pictures and dates whoever is speaking, and a headed list names
	// whoever acted, so neither needs the actor row above it.
	const hasSpeaker = !! thread?.speaker;
	const hasActorRow = view.hasActor && ! hasSpeaker && ! view.peopleHeading;

	const body = (
		<div className={ className }>
			<NoteBody note={ note } isBlockHidden={ view.isBlockHidden } />
		</div>
	);

	return (
		<VStack className="wpnc-simplified" spacing={ 4 }>
			{ hasActorRow && (
				<ActorRow
					note={ note }
					sentence={ view.sentence }
					target={ view.target }
					avatars={ view.avatars }
					origin={ origin }
					follow={ view.follow }
				/>
			) }
			{ view.post && <PostCard { ...view.post } /> }
			{ thread && (
				<Thread
					thread={ thread }
					meta={ <NoteMeta note={ note } origin={ origin } follow={ view.follow } /> }
					parentMeta={
						parentDate && (
							<Text className="wpnc-simplified__quiet-links" size={ 12 } variant="muted">
								<NoteTime
									timestamp={ parentDate }
									url={ note.parent_comment?.url ?? thread.parent?.url ?? note.url }
								/>
							</Text>
						)
					}
				>
					{ body }
				</Thread>
			) }
			{ view.card && <ContextCard { ...view.card } /> }
			{ view.peopleHeading && (
				<Heading className="wpnc-simplified__heading" level={ 3 } size={ 13 } weight={ 600 }>
					{ view.peopleHeading }
				</Heading>
			) }
			{ ! hasSpeaker && body }
		</VStack>
	);
}
