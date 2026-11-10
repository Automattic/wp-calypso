import { zipWithSignature } from '../../../panel/templates/functions';
import { useAppContext } from '../../context';
import FollowLink, { followStatTypes } from '../../templates/follow-link';
import { formatFullTime, formatNoteTime } from '../format-note-time';
import MetaList from './meta-list';
import type { BlockWithSignature, Note } from '../../types';
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

const getFollow = ( note: Note ) => {
	if ( note.type === 'comment' || note.meta?.actor_count !== 1 ) {
		return undefined;
	}
	const person = ( zipWithSignature( note.body, note ) as BlockWithSignature[] ).find(
		( { signature } ) => signature.type === 'user'
	)?.block;
	const siteId = person?.meta?.ids?.site;

	return siteId && person?.actions && 'follow' in person.actions
		? { siteId, isFollowing: !! person.actions.follow }
		: undefined;
};

export default function NoteMeta( { note, children }: { note: Note; children?: ReactNode } ) {
	const follow = getFollow( note );

	return (
		<MetaList>
			{ children }
			<NoteTime timestamp={ note.timestamp } url={ note.url } />
			{ follow && (
				<FollowLink
					site={ follow.siteId }
					isFollowing={ follow.isFollowing }
					noteType={ note.type as keyof typeof followStatTypes }
				/>
			) }
		</MetaList>
	);
}
