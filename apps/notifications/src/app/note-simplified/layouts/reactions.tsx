import { getContext } from '../data/context';
import { getPeopleHeading } from '../labels';
import Body from '../parts/body';
import Context from '../parts/context';
import PeopleHeading from '../parts/people-heading';
import type { Note } from '../../types';

export default function ReactionsNote( { note }: { note: Note } ) {
	const context = getContext( note );

	return (
		<>
			<Context context={ context } />
			<PeopleHeading>{ getPeopleHeading( note ) }</PeopleHeading>
			<Body note={ note } hidePost={ context?.kind === 'post' && !! context.post } />
		</>
	);
}
