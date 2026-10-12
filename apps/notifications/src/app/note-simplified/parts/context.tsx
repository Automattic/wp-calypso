import PostCard from './post-card';
import Thread from './thread';
import type { Note } from '../../types';

/** What the note concerns: the post, and the comment on it when there is one. */
export default function Context( { note }: { note: Note } ) {
	const { post, site, parent_comment: comment } = note.meta ?? {};

	return (
		<>
			{ post && <PostCard post={ post } site={ site } /> }
			{ comment && <Thread repliedTo={ comment } /> }
		</>
	);
}
