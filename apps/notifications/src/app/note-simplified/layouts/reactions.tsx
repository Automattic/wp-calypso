import Body from '../parts/body';
import Context from '../parts/context';
import PeopleHeading from '../parts/people-heading';
import type { Note } from '../../types';

export default function ReactionsNote( { note }: { note: Note } ) {
	return (
		<>
			<Context note={ note } />
			<PeopleHeading>{ note.meta?.heading ?? note.title }</PeopleHeading>
			<Body note={ note } hidePost={ !! note.meta?.post } />
		</>
	);
}
