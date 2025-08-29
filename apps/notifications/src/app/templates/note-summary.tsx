import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { html } from '../../panel/indices-to-html';
import NoteIcon from './note-icon';
import type { Note } from '../types';

const getNoteIconLink = ( note: Note ) => {
	if ( note.header?.[ 0 ].ranges?.[ 0 ].type === 'user' ) {
		const { id: userId, site_id: siteId, url } = note.header[ 0 ].ranges[ 0 ];
		// Some site notifications populate id with the siteId, so consider the userId falsy in this
		// case.
		return userId && userId !== siteId ? `https://wordpress.com/reader/users/id/${ userId }` : url;
	}

	return '';
};

const NoteSummaryIcon = ( { note }: { note: Note } ) => {
	const link = getNoteIconLink( note );
	const content = (
		<div style={ { position: 'relative', flexShrink: 0 } }>
			<div style={ { width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' } }>
				<NoteIcon icon={ note.icon } size={ 32 } />
			</div>
		</div>
	);

	if ( ! link ) {
		return content;
	}

	return (
		<a href={ link } target="_blank" rel="noopener noreferrer">
			{ content }
		</a>
	);
};

const NoteSummary = ( { note }: { note: Note } ) => {
	return (
		<HStack justify="flex-start" spacing={ 4 }>
			<NoteSummaryIcon note={ note } />
			<VStack className="wpnc__text-summary">
				<ExternalLink href={ note.url }>
					<span
						className="wpnc__subject"
						/* eslint-disable-next-line react/no-danger */
						dangerouslySetInnerHTML={ {
							__html: html( note.subject[ 0 ], {
								links: false,
							} ),
						} }
					/>
				</ExternalLink>
			</VStack>
		</HStack>
	);
};

export default NoteSummary;
