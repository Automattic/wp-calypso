import { hasComment } from '../data/blocks';
import { getPersonSite, getFollow, getCommenter, hasSinglePerson } from '../data/person';
import { getCommentedPost } from '../data/post';
import { getRepliedTo } from '../data/replied-to';
import { getSiteHost } from '../data/sentence';
import Body from '../parts/body';
import NoteMeta from '../parts/note-meta';
import PostCard from '../parts/post-card';
import Thread from '../parts/thread';
import { useIsPendingApproval } from '../use-is-pending-approval';
import type { Note } from '../../types';

export default function CommentNote( { note }: { note: Note } ) {
	const isPendingApproval = useIsPendingApproval( note );
	const repliedTo = getRepliedTo( note );
	const post = getCommentedPost( note, repliedTo?.text );
	// A post card names its own site.
	const site = post ? undefined : getSiteHost( note );

	return (
		<>
			{ post && <PostCard { ...post } /> }
			<Thread
				repliedTo={ repliedTo }
				commenter={ getCommenter( note ) }
				meta={
					<NoteMeta
						note={ note }
						site={ isPendingApproval ? getPersonSite( note ) : site }
						follow={ getFollow( note ) }
					/>
				}
			>
				<Body note={ note } hidePeople={ hasComment( note ) || hasSinglePerson( note ) } />
			</Thread>
		</>
	);
}
