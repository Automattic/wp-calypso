import Body from '../parts/body';
import Context from '../parts/context';
import Headline from '../parts/headline';
import type { Note } from '../../types';

export default function NoticeNote( { note }: { note: Note } ) {
	const { post, actor_count: actorCount } = note.meta ?? {};

	return (
		<>
			<Headline note={ note } />
			<Context note={ note } />
			<Body note={ note } hidePeople={ actorCount === 1 } hidePost={ !! post } />
		</>
	);
}
