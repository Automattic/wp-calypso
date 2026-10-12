import ContextCard from './context-card';
import PostCard from './post-card';
import Thread from './thread';
import type { Context as ContextData } from '../data/context';

/** What the note concerns: the comment it is for, the post, or the card its header describes. */
export default function Context( { context }: { context?: ContextData } ) {
	switch ( context?.kind ) {
		case 'comment':
			return (
				<>
					{ context.post && <PostCard { ...context.post } /> }
					<Thread repliedTo={ context.repliedTo } />
				</>
			);
		case 'post':
			return context.post ? <PostCard { ...context.post } /> : null;
		case 'card':
			return <ContextCard { ...context.card } />;
		default:
			return null;
	}
}
