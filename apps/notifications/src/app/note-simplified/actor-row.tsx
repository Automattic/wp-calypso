import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { html } from '../../panel/indices-to-html';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import FollowLink, { followStatTypes } from '../templates/follow-link';
import { getHeaderLink } from '../templates/note-summary';
import { formatFullTime, formatNoteTime } from './format-note-time';
import type { NoteView } from './note-view';
import type { Note, Subject } from '../types';

const Avatars = ( { avatars, link }: { avatars: string[]; link?: string } ) => {
	const icons = avatars.map( ( url, index ) => (
		// eslint-disable-next-line react/no-array-index-key -- placeholder avatars repeat.
		<NoteIcon key={ index } icon={ url } size={ 32 } />
	) );

	if ( avatars.length === 1 && link ) {
		return (
			<a className="wpnc-simplified__avatars" href={ link } target="_blank" rel="noreferrer">
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
		<HStack className="wpnc-simplified__actor" alignment="top" justify="flex-start" spacing={ 3 }>
			<Avatars avatars={ avatars } link={ getHeaderLink( sentence ) } />
			<VStack spacing={ 0 }>
				<div
					className="wpnc-simplified__sentence"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: html( sentence ) } }
				/>
				{ target && (
					<a
						className="wpnc-simplified__target"
						href={ target.url ?? note.url }
						target="_blank"
						rel="noreferrer"
					>
						{ target.title }
					</a>
				) }
				<HStack className="wpnc-simplified__meta" justify="flex-start" spacing={ 1 } wrap>
					<NoteTime timestamp={ note.timestamp } url={ note.url } />
					{ origin && (
						<>
							<span aria-hidden="true">·</span>
							<span className="wpnc-simplified__origin">{ origin }</span>
						</>
					) }
					{ follow && (
						<>
							<span aria-hidden="true">·</span>
							<FollowLink
								site={ follow.siteId }
								isFollowing={ follow.isFollowing }
								noteType={ note.type as keyof typeof followStatTypes }
							/>
						</>
					) }
				</HStack>
			</VStack>
		</HStack>
	);
}
