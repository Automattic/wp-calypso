import { __experimentalText as Text } from '@wordpress/components';
import { zipWithSignature } from '../../../panel/templates/functions';
import { useAppContext } from '../../context';
import FollowLink, { followStatTypes } from '../../templates/follow-link';
import { formatFullTime, formatNoteTime } from '../format-note-time';
import type { BlockWithSignature, Note } from '../../types';

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

/** The site of the one person behind a note, under the same rule the detailed rows use. */
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

/** When it happened, then a Subscribe link when one person with a site did it. */
export default function NoteMeta( { note }: { note: Note } ) {
	const follow = getFollow( note );

	return (
		<Text className="wpnc-simplified__quiet-links" size={ 12 } variant="muted">
			<NoteTime timestamp={ note.timestamp } url={ note.url } />
			{ follow && (
				<>
					{ ' · ' }
					<FollowLink
						site={ follow.siteId }
						isFollowing={ follow.isFollowing }
						noteType={ note.type as keyof typeof followStatTypes }
					/>
				</>
			) }
		</Text>
	);
}
