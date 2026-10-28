import PostCard from './post-card';
import Thread, { ThreadParent } from './thread';
import type { Note } from '../../types';

export default function Context( { note }: { note: Note } ) {
	const { post, site, parent_comment: comment } = note.meta ?? {};

	return (
		<>
			{ post && <PostCard post={ post } site={ site } url={ comment?.url } /> }
			{ comment && (
				<Thread>
					<ThreadParent comment={ comment } />
				</Thread>
			) }
		</>
	);
}
