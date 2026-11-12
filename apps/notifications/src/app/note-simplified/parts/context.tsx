import PostCard from './post-card';
import Thread, { ThreadParent } from './thread';
import type { Note } from '../../types';

export default function Context( { note, quote = false }: { note: Note; quote?: boolean } ) {
	const { post, site, parent_comment: comment } = note.meta ?? {};

	return (
		<>
			{ post && <PostCard post={ post } site={ site } url={ comment?.url } /> }
			{ comment && (
				<Thread>
					{ quote ? (
						// The same two-line quote as above a reply: the likes are the news,
						// and the comment only says which one.
						<ThreadParent comment={ comment } truncate compact />
					) : (
						<ThreadParent comment={ comment } maxLength={ 300 } />
					) }
				</Thread>
			) }
		</>
	);
}
