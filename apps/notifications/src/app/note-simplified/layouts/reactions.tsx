import {
	CardDivider,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { getTemporaryNoteTitle } from '../labels';
import Body from '../parts/body';
import Context from '../parts/context';
import type { Note } from '../../types';

export default function ReactionsNote( { note }: { note: Note } ) {
	const heading = note.meta?.heading;

	return (
		<>
			<Context note={ note } />
			{ heading && heading !== getTemporaryNoteTitle( note ) && (
				<VStack className="wpnc-simplified__heading" spacing={ 3 }>
					<Heading level={ 3 } size={ 15 } weight="var(--wpds-typography-font-weight-emphasis)">
						{ heading }
					</Heading>
					<CardDivider />
				</VStack>
			) }
			<Body note={ note } hidePost={ !! note.meta?.post } />
		</>
	);
}
