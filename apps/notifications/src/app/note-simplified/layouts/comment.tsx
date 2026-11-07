import { zipWithSignature } from '../../../panel/templates/functions';
import Body from '../parts/body';
import NoteMeta from '../parts/note-meta';
import PendingApproval from '../parts/pending-approval';
import PostCard from '../parts/post-card';
import Thread, { ThreadParent, ThreadReply } from '../parts/thread';
import { useIsPendingApproval } from '../use-is-pending-approval';
import type { BlockWithSignature, Note, NoteActor } from '../../types';

/**
 * Builds the commenter from the user block in the note's body.
 */
const getCommenterFromBody = ( note: Note ): NoteActor | undefined => {
	const person = ( zipWithSignature( note.body, note ) as BlockWithSignature[] ).find(
		( { signature } ) => signature.type === 'user'
	)?.block;
	if ( ! person?.text ) {
		return undefined;
	}
	const userId = person.meta?.ids?.user;

	return {
		name: person.text,
		avatar: person.media?.[ 0 ]?.url ?? '',
		url: userId ? `https://wordpress.com/reader/users/id/${ userId }` : person.meta?.links?.home,
	};
};

export default function CommentNote( { note }: { note: Note } ) {
	const isPendingApproval = useIsPendingApproval( note );
	const { post, site, parent_comment: repliedTo, actor } = note.meta ?? {};
	const commenter = actor ?? getCommenterFromBody( note );

	return (
		<>
			{ post && <PostCard post={ post } site={ site } url={ note.url } /> }
			<Thread spacing={ 4 } isReply={ !! repliedTo }>
				{ repliedTo && <ThreadParent comment={ repliedTo } truncate /> }
				{ commenter && (
					<ThreadReply
						commenter={ commenter }
						meta={ <NoteMeta note={ note } /> }
						status={ isPendingApproval && <PendingApproval note={ note } /> }
					>
						<Body note={ note } hidePeople />
					</ThreadReply>
				) }
			</Thread>
			{ ! commenter && <Body note={ note } /> }
		</>
	);
}
