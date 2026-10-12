import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { html } from '../../../panel/indices-to-html';
import NoteIcon from '../../note-icon';
import NoteMeta from './note-meta';
import type { Note } from '../../types';

const Avatars = ( { avatars, link }: { avatars: string[]; link?: string | null } ) => {
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

/** Who did it and what they did, for notes with someone behind them. */
export default function Headline( { note }: { note: Note } ) {
	const { actors = [], summary } = note.meta ?? {};
	if ( ! summary || ! actors.length ) {
		return null;
	}

	return (
		<HStack alignment="top" justify="flex-start" spacing={ 3 }>
			<Avatars
				avatars={ actors.length > 1 ? actors.map( ( { avatar } ) => avatar ) : [ note.icon ] }
				link={ actors[ 0 ].url }
			/>
			<VStack className="wpnc-simplified__quiet-links" spacing={ 0 }>
				<div
					className="wpnc-simplified__sentence"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: html( summary ) } }
				/>
				<NoteMeta note={ note } />
			</VStack>
		</HStack>
	);
}
