import { __experimentalVStack as VStack } from '@wordpress/components';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getIsNotePendingApproval from '../../panel/state/selectors/get-is-note-pending-approval';
import { NoteBody } from '../templates/body';
import FollowLink, { followStatTypes } from '../templates/follow-link';
import ActorRow, { NoteTime } from './actor-row';
import { getNoteView } from './note-view';
import { ContextCard, PostCard } from './preview';
import SubscriptionNotice from './subscription-notice';
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
	const hasActorRow = ! hasSpeaker && ! view.peopleHeading;

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
			{ view.isFromSubscription && <SubscriptionNotice /> }
			{ thread && (
				<Thread
					thread={ thread }
					meta={
						<>
							<NoteTime timestamp={ note.timestamp } url={ note.url } />
							{ origin && ` · ${ origin }` }
							{ view.follow && (
								<>
									{ ' · ' }
									<FollowLink
										site={ view.follow.siteId }
										isFollowing={ view.follow.isFollowing }
										noteType={ note.type as keyof typeof followStatTypes }
									/>
								</>
							) }
						</>
					}
					parentMeta={
						parentDate && (
							<NoteTime
								timestamp={ parentDate }
								url={ note.parent_comment?.url ?? thread.parent?.url ?? note.url }
							/>
						)
					}
				>
					{ body }
				</Thread>
			) }
			{ view.card && <ContextCard { ...view.card } /> }
			{ view.peopleHeading && (
				<div className="wpnc-simplified__heading">{ view.peopleHeading }</div>
			) }
			{ ! hasSpeaker && body }
		</VStack>
	);
}
