/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useSelector } from 'react-redux';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import FollowLink, { followStatTypes } from './follow-link';
import type { Note, Block } from '../types';

function getDisplayURL( url: string ) {
	const parser = document.createElement( 'a' );
	parser.href = url;
	return ( parser.hostname + parser.pathname ).replace( /\/$/, '' );
}

/**
 * Format a timestamp for showing how long ago an event occurred.
 * Specifically here for showing when a comment was made.
 *
 * If within the past five days, a relative time
 * e.g. "23 sec. ago", "15 min. ago", "4 hrs. ago", "1 day ago"
 *
 * If older than five days, absolute date
 * e.g. "Apr 30, 2015"
 */
function formatDate( timestamp: string, locale: string ) {
	const date = new Date( timestamp );
	const now = new Date();
	const diffMs = date.getTime() - now.getTime();
	const diffDays = Math.round( diffMs / ( 1000 * 60 * 60 * 24 ) );

	if ( Math.abs( diffDays ) < 5 ) {
		const rtf = new Intl.RelativeTimeFormat( locale, { numeric: 'auto' } );
		return rtf.format( diffDays, 'day' );
	}

	return new Intl.DateTimeFormat( locale, {
		year: 'numeric' as const,
		month: 'short' as const,
		day: 'numeric' as const,
	} ).format( date );
}

export default function UserBlock( { note, block }: { note: Note; block: Block } ) {
	const { locale } = useAppContext();
	const isApproved = useSelector( ( state ) => getIsNoteApproved( state, note ) );
	const homeLink = block.meta?.links?.home || '';
	const media = block.media?.[ 0 ];
	const userId = block?.meta?.ids?.user;
	const readerProfileUrl = userId ? `https://wordpress.com/reader/users/id/${ userId }` : homeLink;

	// Display the user's URL instead of the site title when:
	// 1. No site title is provided.
	// 2. The comment is unapproved, making potential spam easier to identify.
	const homeTitle =
		homeLink && ( ! block.meta?.titles?.home || ( note.type === 'comment' && ! isApproved ) )
			? getDisplayURL( homeLink )
			: block.meta?.titles?.home;

	return (
		<HStack className="wpnc__user" justify="flex-start" alignment="flex-start" spacing={ 4 }>
			<a
				href={ readerProfileUrl }
				target="_blank"
				rel="noreferrer"
				style={ {
					display: 'flex',
					flexShrink: 0,
					borderRadius: '50%',
					overflow: 'hidden',
				} }
			>
				<NoteIcon icon={ media?.url } alt={ block.text } size={ 32 } />
			</a>
			<VStack alignment="flex-start" spacing={ 0 }>
				<a className="wpnc__user-title" href={ readerProfileUrl } target="_blank" rel="noreferrer">
					<Text>{ block.text }</Text>
				</a>
				<HStack className="wpnc__user-description" spacing={ 1 }>
					{ note.type === 'comment' && (
						<a href={ note.url } target="_blank" rel="noreferrer" style={ { flexShrink: 0 } }>
							<Text variant="muted">{ formatDate( note.timestamp, locale ) }</Text>
						</a>
					) }
					<span className="wpnc__user-description-separator">•</span>
					{ homeTitle && (
						<a
							href={ homeLink }
							target="_blank"
							rel="noopener noreferrer"
							style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
						>
							{ homeTitle }
						</a>
					) }
					<span className="wpnc__user-description-separator">•</span>
					{ note.type !== 'comment' &&
						!! block.meta?.ids?.site &&
						block.actions &&
						'follow' in block.actions && (
							<FollowLink
								site={ block.meta.ids.site }
								isFollowing={ !! block.actions.follow }
								noteType={ note.type as keyof typeof followStatTypes }
							/>
						) }
				</HStack>
			</VStack>
		</HStack>
	);
}
