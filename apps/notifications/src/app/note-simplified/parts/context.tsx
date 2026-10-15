import PostCard from './post-card';
import Thread from './thread';
import type { Note } from '../../types';

export default function Context( { note }: { note: Note } ) {
	const { post, site, parent_comment: comment } = note.meta ?? {};

	return (
		<>
			{ post && <PostCard post={ post } site={ site } /> }
			{ comment && <Thread repliedTo={ comment } /> }
		</>
	);
}
