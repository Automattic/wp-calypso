import {
	CardDivider,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { getTemporaryNoteTitle } from '../labels';
import Body from '../parts/body';
import Context from '../parts/context';
import type { Note } from '../../types';

// Likes carry their count in the pane title, so they don't repeat it as a heading.
const LIKE_TYPES = [ 'like', 'comment_like' ];

export default function ReactionsNote( { note }: { note: Note } ) {
	const heading = note.meta?.heading ?? note.title;
	const isLike = LIKE_TYPES.includes( note.type );

	return (
		<>
			<Context note={ note } quote={ isLike } />
			{ heading && ! isLike && heading !== getTemporaryNoteTitle( note ) && (
				<VStack className="wpnc-simplified__heading" spacing={ 3 }>
					<Heading
						level={ 3 }
						size={ 15 }
						weight="var(--wpds-typography-font-weight-emphasis, 600)"
					>
						{ heading }
					</Heading>
					<CardDivider />
				</VStack>
			) }
			<Body note={ note } hidePost={ !! note.meta?.post } />
		</>
	);
}
