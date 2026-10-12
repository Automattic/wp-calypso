import { __experimentalText as Text } from '@wordpress/components';
import { Fragment } from 'react';
import { useAppContext } from '../../context';
import FollowLink, { followStatTypes } from '../../templates/follow-link';
import { formatFullTime, formatNoteTime } from '../format-note-time';
import type { Note } from '../../types';
import type { Follow } from '../data/person';
import type { ReactNode } from 'react';

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
export default function NoteMeta( {
	note,
	site,
	follow,
}: {
	note: Note;
	site?: string;
	follow?: Follow;
} ) {
	const parts: ReactNode[] = [
		<NoteTime key="time" timestamp={ note.timestamp } url={ note.url } />,
		site,
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
}
