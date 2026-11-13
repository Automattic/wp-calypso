import { __, sprintf } from '@wordpress/i18n';
import Body from '../parts/body';
import NoteMeta from '../parts/note-meta';
import PendingApproval from '../parts/pending-approval';
import PostCard from '../parts/post-card';
import Thread, { ThreadParent, ThreadReply } from '../parts/thread';
import { useIsPendingApproval } from '../use-is-pending-approval';
import type { Note } from '../../types';

export default function CommentNote( { note }: { note: Note } ) {
	const isPendingApproval = useIsPendingApproval( note );
	const { post, site, parent_comment: repliedTo, actor } = note.meta ?? {};

	return (
		<>
			{ post && <PostCard post={ post } site={ site } url={ note.url } /> }
			<Thread spacing={ 4 }>
				{ repliedTo && (
					<ThreadParent
						comment={ repliedTo }
						truncate
						compact
						label={ sprintf(
							/* translators: %s is the name of the person whose comment was replied to. */
							__( 'In reply to %s' ),
							repliedTo.author_name
						) }
					/>
				) }
				{ actor && (
					<ThreadReply
						commenter={ actor }
						meta={ <NoteMeta note={ note } /> }
						status={ isPendingApproval && <PendingApproval /> }
					>
						<Body note={ note } hidePeople />
					</ThreadReply>
				) }
			</Thread>
		</>
	);
}
