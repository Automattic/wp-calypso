import {
	CardDivider,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { _n, sprintf } from '@wordpress/i18n';
import { getTemporaryNoteTitle } from '../labels';
import Body from '../parts/body';
import Context from '../parts/context';
import type { Note } from '../../types';
import type { ReactNode } from 'react';

// Likes and new subscribers carry their count in the pane title, so they don't
// repeat it as a heading, and list the people evenly apart.
const PEOPLE_LIST_TYPES = [ 'like', 'comment_like', 'follow' ];

const getOthersText = ( type: string, others: number ) => {
	switch ( type ) {
		case 'comment_like':
			return sprintf(
				/* translators: %d is the number of people who liked the comment but aren't listed. */
				_n(
					'And <a>%d other</a> liked your comment.',
					'And <a>%d others</a> liked your comment.',
					others
				),
				others
			);
		case 'follow':
			return sprintf(
				/* translators: %d is the number of people who subscribed but aren't listed. */
				_n( 'And <a>%d other</a> subscribed.', 'And <a>%d others</a> subscribed.', others ),
				others
			);
		default:
			return sprintf(
				/* translators: %d is the number of people who liked the post but aren't listed. */
				_n(
					'And <a>%d other</a> liked your post.',
					'And <a>%d others</a> liked your post.',
					others
				),
				others
			);
	}
};

export default function ReactionsNote( { note, header }: { note: Note; header?: ReactNode } ) {
	const heading = note.meta?.heading ?? note.title;

	if ( PEOPLE_LIST_TYPES.includes( note.type ) ) {
		// The server lists at most ten people, with a line linking to the rest; count
		// the rest instead.
		const people = note.body.filter( ( block ) => block.type === 'user' ).length;
		const others = ( note.meta?.actor_count ?? 0 ) - people;
		const othersUrl =
			note.body.find( ( block ) => block.type !== 'user' )?.ranges?.find( ( range ) => range.url )
				?.url ?? note.url;

		return (
			<VStack className="wpnc-simplified__people" spacing={ 4 }>
				{ header }
				<Context note={ note } quote />
				<Body note={ note } hidePost={ !! note.meta?.post } hideText={ others > 0 } />
				{ others > 0 && (
					<Text className="wpnc-simplified__more-people" as="p">
						{ createInterpolateElement( getOthersText( note.type, others ), {
							a: <a href={ othersUrl } target="_blank" rel="noopener noreferrer" />,
						} ) }
					</Text>
				) }
			</VStack>
		);
	}

	return (
		<>
			<Context note={ note } />
			{ heading && heading !== getTemporaryNoteTitle( note ) && (
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
