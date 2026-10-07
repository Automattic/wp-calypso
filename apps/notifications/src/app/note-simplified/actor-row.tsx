import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Fragment } from 'react';
import { html } from '../../panel/indices-to-html';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import FollowLink, { followStatTypes } from '../templates/follow-link';
import { getHeaderLink } from '../templates/note-summary';
import { formatFullTime, formatNoteTime } from './format-note-time';
import type { NoteView } from './note-view';
import type { Note, Subject } from '../types';
import type { ReactNode } from 'react';

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

export const NoteTime = ( { timestamp, url }: { timestamp: string; url: string } ) => {
	const { locale } = useAppContext();

	return (
		<a href={ url } target="_blank" rel="noreferrer">
			<time dateTime={ timestamp } title={ formatFullTime( timestamp, locale ) }>
				{ formatNoteTime( timestamp, locale ) }
			</time>
		</a>
	);
};

/** When it happened, then where and the author's Subscribe link if known. */
export const NoteMeta = ( {
	note,
	origin,
	follow,
}: {
	note: Note;
	origin?: string;
	follow?: NoteView[ 'follow' ];
} ) => {
	const parts: ReactNode[] = [
		<NoteTime key="time" timestamp={ note.timestamp } url={ note.url } />,
		origin,
		follow && (
			<FollowLink
				key="follow"
				site={ follow.siteId }
				isFollowing={ follow.isFollowing }
				noteType={ note.type as keyof typeof followStatTypes }
			/>
		),
	].filter( Boolean );

	return (
		<Text className="wpnc-simplified__quiet-links" size={ 12 } variant="muted">
			{ parts.map( ( part, index ) => (
				// eslint-disable-next-line react/no-array-index-key -- the parts never reorder.
				<Fragment key={ index }>
					{ index > 0 && ' · ' }
					{ part }
				</Fragment>
			) ) }
		</Text>
	);
};

export default function ActorRow( {
	note,
	sentence,
	target,
	avatars,
	origin,
	follow,
}: {
	note: Note;
	sentence: Subject;
	target?: NoteView[ 'target' ];
	avatars: string[];
	origin?: string;
	follow?: NoteView[ 'follow' ];
} ) {
	return (
		<HStack alignment="top" justify="flex-start" spacing={ 3 }>
			<Avatars avatars={ avatars } link={ getHeaderLink( sentence ) } />
			<VStack className="wpnc-simplified__quiet-links" spacing={ 0 }>
				<div>
					<div
						className="wpnc-simplified__sentence"
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ { __html: html( sentence ) } }
					/>
					{ target && (
						<a href={ target.url ?? note.url } target="_blank" rel="noreferrer">
							{ target.title }
						</a>
					) }
				</div>
				<NoteMeta note={ note } origin={ origin } follow={ follow } />
			</VStack>
		</HStack>
	);
}
