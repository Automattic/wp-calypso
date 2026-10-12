import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { html } from '../../../panel/indices-to-html';
import NoteIcon from '../../note-icon';
import { getHeaderLink } from '../../templates/note-summary';
import NoteMeta from './note-meta';
import type { Note, Subject } from '../../types';
import type { Follow } from '../data/person';
import type { Item } from '../data/sentence';

const Avatars = ( { avatars, link }: { avatars: string[]; link?: string } ) => {
	const icons = avatars.map( ( url, index ) => (
		// eslint-disable-next-line react/no-array-index-key -- placeholder avatars repeat.
		<NoteIcon key={ index } icon={ url } size={ 36 } />
	) );

	if ( avatars.length === 1 && link ) {
		return (
			// The sentence beside it links to the same person, so the photo stays out of the tab order.
			<a
				className="wpnc-simplified__avatars"
				href={ link }
				target="_blank"
				rel="noreferrer"
				tabIndex={ -1 }
				aria-hidden="true"
			>
				{ icons }
			</a>
		);
	}

	return <div className="wpnc-simplified__avatars">{ icons }</div>;
};

/** Who did it and what they did, when no one's words or list of people says so. */
export default function Headline( {
	note,
	whatHappened,
	item,
	avatars,
	site,
	follow,
}: {
	note: Note;
	whatHappened: Subject;
	item?: Item;
	avatars: string[];
	site?: string;
	follow?: Follow;
} ) {
	return (
		<HStack alignment="top" justify="flex-start" spacing={ 3 }>
			<Avatars avatars={ avatars } link={ getHeaderLink( whatHappened ) } />
			<VStack className="wpnc-simplified__quiet-links" spacing={ 0 }>
				<div>
					<div
						className="wpnc-simplified__sentence"
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ { __html: html( whatHappened ) } }
					/>
					{ item && (
						<a href={ item.url ?? note.url } target="_blank" rel="noreferrer">
							{ item.title }
						</a>
					) }
				</div>
				<NoteMeta note={ note } site={ site } follow={ follow } />
			</VStack>
		</HStack>
	);
}
