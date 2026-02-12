import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { html } from '../../panel/indices-to-html';
import NoteIcon from '../note-icon';
import type { Note } from '../types';
import type { CSSProperties } from 'react';

const getNoteIconLink = ( note: Note ) => {
	const user = ( note.subject?.[ 0 ].ranges || [] ).find( ( { type } ) => type === 'user' );
	if ( user ) {
		const { id: userId, site_id: siteId, url } = user;
		// Some site notifications populate id with the siteId, so consider the userId falsy in this
		// case.
		return userId && userId !== siteId ? `https://wordpress.com/reader/users/id/${ userId }` : url;
	}

	return '';
};

const NoteSummaryIcon = ( { note }: { note: Note } ) => {
	const link = getNoteIconLink( note );
	const style: CSSProperties = { display: 'flex', flexShrink: 0 };
	const content = <NoteIcon icon={ note.icon } size={ 32 } />;

	if ( ! link ) {
		return <div style={ style }> { content }</div>;
	}

	return (
		<a href={ link } style={ style } target="_blank" rel="noopener noreferrer">
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
