import {
	CardDivider,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import Body from '../parts/body';
import Context from '../parts/context';
import type { Note } from '../../types';

export default function ReactionsNote( { note }: { note: Note } ) {
	return (
		<>
			<Context note={ note } />
			<VStack spacing={ 3 }>
				<Heading level={ 3 } size={ 15 } weight={ 600 }>
					{ note.meta?.heading ?? note.title }
				</Heading>
				<CardDivider />
			</VStack>
			<Body note={ note } hidePost={ !! note.meta?.post } />
		</>
	);
}
