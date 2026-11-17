import { VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { zipWithSignature } from '../../../panel/templates/functions';
import { useAppContext } from '../../context';
import FollowLink, { followStatTypes } from '../../templates/follow-link';
import { formatFullTime, formatNoteTime } from '../format-note-time';
import ArrowSmall from './arrow-small';
import MetaList from './meta-list';
import type { BlockWithSignature, Note } from '../../types';
import type { ReactNode } from 'react';

/**
 * The time a note or comment was made, linking to it. `isComment` follows it with an
 * arrow, the panel's sign for opening a comment on its site.
 */
export const NoteTime = ( {
	timestamp,
	url,
	isComment = false,
}: {
	timestamp: string;
	url: string;
	isComment?: boolean;
} ) => {
	const { locale } = useAppContext();

	return (
		<a
			className={ isComment ? 'wpnc-simplified__comment-link' : undefined }
			href={ url }
			target="_blank"
			rel="noreferrer"
		>
			<time dateTime={ timestamp } title={ formatFullTime( timestamp, locale ) }>
				{ formatNoteTime( timestamp, locale ) }
			</time>
			{ isComment && (
				<>
					<ArrowSmall className="wpnc-simplified__comment-arrow" />
					<VisuallyHidden>{ __( 'View comment' ) }</VisuallyHidden>
				</>
			) }
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

export default function NoteMeta( {
	note,
	isComment = false,
	children,
}: {
	note: Note;
	isComment?: boolean;
	children?: ReactNode;
} ) {
	const follow = getFollow( note );

	return (
		<MetaList>
			{ children }
			<NoteTime timestamp={ note.timestamp } url={ note.url } isComment={ isComment } />
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
