import { __experimentalVStack as VStack } from '@wordpress/components';
import CommentNote from './layouts/comment';
import NewPostNote from './layouts/new-post';
import NoticeNote from './layouts/notice';
import ReactionsNote from './layouts/reactions';
import type { Note } from '../types';
import type { ComponentType } from 'react';
import './style.scss';

const LAYOUT_BY_TYPE: Record< string, ComponentType< { note: Note } > > = {
	comment: CommentNote,
	automattcher: CommentNote,
	like: ReactionsNote,
	comment_like: ReactionsNote,
	reblog: ReactionsNote,
	follow: ReactionsNote,
	new_post: NewPostNote,
};

export const hasNoteContext = ( note: Note ) => !! note.meta?.actor;

export default function SimplifiedNote( { note }: { note: Note } ) {
	const Layout = LAYOUT_BY_TYPE[ note.type ] ?? NoticeNote;

	return (
		<VStack spacing={ 4 }>
			<Layout note={ note } />
		</VStack>
	);
}
