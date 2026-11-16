/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import clsx from 'clsx';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { isPeopleListNote } from '../../panel/helpers/notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import FollowLink, { followStatTypes } from './follow-link';
import type { Note, Block } from '../types';
import type { ReactElement } from 'react';

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
	// 3. The site title only repeats the user's name.
	const siteTitle = block.meta?.titles?.home;
	const homeTitle =
		homeLink &&
		( ! siteTitle ||
			( note.type === 'comment' && ! isApproved ) ||
			siteTitle.trim().toLowerCase() === block.text?.trim().toLowerCase() )
			? getDisplayURL( homeLink )
			: siteTitle;

	// Build the present description items, then interleave a single separator
	// between them — so there's never a leading, trailing, or doubled separator
	// when an item is absent.
	const descriptionParts = [
		note.type === 'comment' && (
			<a key="date" href={ note.url } target="_blank" rel="noreferrer" style={ { flexShrink: 0 } }>
				<Text variant="muted">{ formatDate( note.timestamp, locale ) }</Text>
			</a>
		),
		homeTitle && (
			<a
				key="home"
				href={ homeLink }
				target="_blank"
				rel="noopener noreferrer"
				style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
			>
				{ homeTitle }
			</a>
		),
		note.type !== 'comment' &&
			!! block.meta?.ids?.site &&
			block.actions &&
			'follow' in block.actions && (
				<FollowLink
					key="follow"
					site={ block.meta.ids.site }
					isFollowing={ !! block.actions.follow }
					noteType={ note.type as keyof typeof followStatTypes }
				/>
			),
	].filter( ( part ): part is ReactElement => Boolean( part ) );

	const isListItem = isPeopleListNote( note );
	// A list offers Subscribe only for sites you don't subscribe to yet.
	const isFollowing = !! block.actions && 'follow' in block.actions && !! block.actions.follow;
	const follow = ! isFollowing && descriptionParts.find( ( { key } ) => key === 'follow' );

	return (
		<HStack
			className={ clsx( 'wpnc__user', { 'is-list-item': isListItem } ) }
			justify="flex-start"
			alignment={ isListItem ? 'center' : 'flex-start' }
			spacing={ isListItem ? 3 : 4 }
		>
			<a className="wpnc__user-icon" href={ readerProfileUrl } target="_blank" rel="noreferrer">
				<NoteIcon icon={ media?.url } alt={ block.text } size={ 36 } />
			</a>
			{ isListItem ? (
				<>
					<VStack
						className="wpnc__user-text"
						justify="center"
						spacing={ 0 }
						style={ { flex: 1, minWidth: 0 } }
					>
						<a
							className="wpnc__user-title"
							href={ readerProfileUrl }
							target="_blank"
							rel="noreferrer"
						>
							<Text className="wpnc__user-name" truncate numberOfLines={ 1 }>
								{ block.text }
							</Text>
						</a>
						{ ( homeTitle || follow ) && (
							<HStack className="wpnc__user-meta" justify="flex-start" spacing={ 1 }>
								{ homeTitle && (
									<a
										href={ homeLink }
										target="_blank"
										rel="noopener noreferrer"
										style={ { minWidth: 0 } }
									>
										<Text
											className="wpnc__user-site"
											color="var(--wpnc-user-meta-color)"
											truncate
											numberOfLines={ 1 }
										>
											{ homeTitle }
										</Text>
									</a>
								) }
								{ homeTitle && follow && (
									<span className="wpnc__user-description-separator">·</span>
								) }
								{ follow }
							</HStack>
						) }
					</VStack>
				</>
			) : (
				<VStack alignment="flex-start" spacing={ 0 }>
					<a
						className="wpnc__user-title"
						href={ readerProfileUrl }
						target="_blank"
						rel="noreferrer"
					>
						<Text>{ block.text }</Text>
					</a>
					<HStack className="wpnc__user-description" spacing={ 1 }>
						{ descriptionParts.map( ( part, index ) => (
							<Fragment key={ part.key }>
								{ index > 0 && <span className="wpnc__user-description-separator">•</span> }
								{ part }
							</Fragment>
						) ) }
					</HStack>
				</VStack>
			) }
		</HStack>
	);
}
