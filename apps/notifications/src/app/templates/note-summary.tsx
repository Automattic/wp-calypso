import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { html } from '../../panel/indices-to-html';
import NoteIcon from '../note-icon';
import type { Note, Subject } from '../types';
import type { CSSProperties } from 'react';

// Resolve the link used to wrap the header avatar / subject text. A user range
// whose id differs from the site id links to the Reader profile (some site
// notifications populate id with the siteId); anything else falls back to the
// range's own url. Mirrors the legacy `SummaryInSingle` behaviour.
const getHeaderLink = ( block: Subject ): string | undefined => {
	const range = block.ranges?.[ 0 ];
	if ( ! range ) {
		return undefined;
	}
	if ( range.type === 'user' && range.id && range.id !== range.site_id ) {
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

// Title row of the detail header. When the header block references multiple
// entities (e.g. "You on Post Title"), render it through `html()` so each
// range keeps its own link, matching the legacy `UserHeader`; otherwise the
// whole title links to the first range's target.
const NoteSummaryTitle = ( { block, link }: { block: Subject; link?: string } ) => {
	if ( ( block.ranges?.length ?? 0 ) > 1 ) {
		// Drop `media` so `html()` doesn't render the avatar inline at full size
		// (it's already shown by `NoteSummaryIcon`).
		return (
			<Text className="wpnc__user-title" weight={ 500 }>
				<span
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: html( { text: block.text, ranges: block.ranges } ) } }
				/>
			</Text>
		);
	}

	if ( link ) {
		return (
			<a className="wpnc__user-title" href={ link } target="_blank" rel="noreferrer">
				<Text weight={ 500 }>{ block.text }</Text>
			</a>
		);
	}

	return (
		<Text className="wpnc__user-title" weight={ 500 }>
			{ block.text }
		</Text>
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
			<HStack justify="flex-start" spacing={ 4 } alignment="center">
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
	// Skip an empty `header[1]`, which would render a label-less link (just its
	// trailing icon) and top-align the icon against a single-line header.
	const hasSnippet = !! snippet?.text?.trim();

	return (
		<HStack
			className="wpnc__user"
			justify="flex-start"
			spacing={ 4 }
			alignment={ hasSnippet ? 'top' : 'center' }
		>
			<NoteSummaryIcon iconUrl={ avatarUrl } link={ subjectLink } />
			<VStack className="wpnc__text-summary" spacing={ 0 }>
				<NoteSummaryTitle block={ subject } link={ subjectLink } />
				{ hasSnippet && <ExternalLink href={ note.url }>{ snippet.text }</ExternalLink> }
			</VStack>
		</HStack>
	);
};

export default NoteSummary;
