import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import NoteIcon from '../note-icon';
import type { Note } from '../types';
import type { CSSProperties } from 'react';

type HeaderBlock = NonNullable< Note[ 'header' ] >[ number ];

// Resolve the link used to wrap the header avatar / subject text. When the
// first range is a user whose id differs from the site id, prefer the Reader
// profile URL; otherwise fall back to the range's url. Mirrors the legacy
// `SummaryInSingle` behaviour.
const getHeaderLink = ( block: HeaderBlock ): string | undefined => {
	const range = block.ranges?.[ 0 ] as
		| { id?: number | string; site_id?: number; url?: string }
		| undefined;
	if ( ! range ) {
		return undefined;
	}
	if ( range.id && range.id !== range.site_id ) {
		return `https://wordpress.com/reader/users/id/${ range.id }`;
	}
	return range.url;
};

const iconWrapStyle: CSSProperties = { display: 'flex', flexShrink: 0 };

const NoteSummaryIcon = ( { iconUrl, link }: { iconUrl?: string; link?: string } ) => {
	const content = <NoteIcon icon={ iconUrl } size={ 32 } />;
	if ( ! link ) {
		return <div style={ iconWrapStyle }>{ content }</div>;
	}
	return (
		<a href={ link } style={ iconWrapStyle } target="_blank" rel="noopener noreferrer">
			{ content }
		</a>
	);
};

// Detail-view header: built from `note.header` so the first row anchors the
// panel with the post owner / author + post title (matching the legacy
// `SummaryInSingle`). Falls back to rendering `note.subject` when a note has
// no `header` block (some system notes).
const NoteSummary = ( { note }: { note: Note } ) => {
	const header = note.header;

	if ( ! header || header.length === 0 ) {
		return (
			<HStack justify="flex-start" spacing={ 4 } alignment="top">
				<NoteSummaryIcon iconUrl={ note.icon } />
				<VStack className="wpnc__text-summary" spacing={ 0 }>
					<ExternalLink href={ note.url }>{ note.subject[ 0 ].text }</ExternalLink>
				</VStack>
			</HStack>
		);
	}

	const subject = header[ 0 ];
	const snippet = header[ 1 ];
	const subjectLink = getHeaderLink( subject );
	const avatarUrl = subject.media?.[ 0 ]?.url;

	return (
		<HStack className="wpnc__user" justify="flex-start" spacing={ 4 } alignment="top">
			<NoteSummaryIcon iconUrl={ avatarUrl } link={ subjectLink } />
			<VStack className="wpnc__text-summary" spacing={ 0 }>
				{ subjectLink ? (
					<a className="wpnc__user-title" href={ subjectLink } target="_blank" rel="noreferrer">
						<Text weight={ 500 }>{ subject.text }</Text>
					</a>
				) : (
					<Text className="wpnc__user-title" weight={ 500 }>
						{ subject.text }
					</Text>
				) }
				{ snippet && <ExternalLink href={ note.url }>{ snippet.text }</ExternalLink> }
			</VStack>
		</HStack>
	);
};

export default NoteSummary;
