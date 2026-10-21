import { __experimentalVStack as VStack } from '@wordpress/components';
import CommentNote from './layouts/comment';
import FollowNote from './layouts/follow';
import NewPostNote from './layouts/new-post';
import NoticeNote from './layouts/notice';
import ReactionsNote from './layouts/reactions';
import type { Note } from '../types';
import type { ComponentType } from 'react';
import './style.scss';

type NoteTypeConfig = {
	Layout: ComponentType< { note: Note } >;
	getPreview?: ( note: Note ) => string | undefined;
};

const getCommentText = ( note: Note ) => note.subject[ 1 ]?.text;

const NOTE_TYPES: Record< string, NoteTypeConfig > = {
	comment: { Layout: CommentNote, getPreview: getCommentText },
	automattcher: { Layout: CommentNote, getPreview: getCommentText },
	like: { Layout: ReactionsNote },
	comment_like: {
		Layout: ReactionsNote,
		getPreview: ( note ) => note.meta?.parent_comment?.text,
	},
	reblog: { Layout: ReactionsNote },
	follow: { Layout: FollowNote },
	new_post: { Layout: NewPostNote },
};

export const hasNoteContext = ( note: Note ) => !! note.meta?.actor;

export const getNotePreview = ( note: Note ) => {
	const getPreview = NOTE_TYPES[ note.type ]?.getPreview;

	return getPreview ? getPreview( note ) : note.meta?.post?.title;
};

export default function SimplifiedNote( { note }: { note: Note } ) {
	const Layout = NOTE_TYPES[ note.type ]?.Layout ?? NoticeNote;

	return (
		<VStack className="wpnc-simplified" spacing={ 4 }>
			<Layout note={ note } />
		</VStack>
	);
}
