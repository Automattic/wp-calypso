import { __experimentalVStack as VStack } from '@wordpress/components';
import CommentNote from './layouts/comment';
import NewPostNote from './layouts/new-post';
import NoticeNote from './layouts/notice';
import ReactionsNote from './layouts/reactions';
import type { Note, NoteKind } from '../types';
import type { ComponentType } from 'react';
import './style.scss';

const LAYOUTS: Record< NoteKind, ComponentType< { note: Note } > > = {
	comment: CommentNote,
	new_post: NewPostNote,
	reactions: ReactionsNote,
	notice: NoticeNote,
};

export const hasNoteContext = ( note: Note ) => !! note.meta?.kind && note.meta.kind in LAYOUTS;

export default function SimplifiedNote( { note }: { note: Note } ) {
	const Layout = LAYOUTS[ note.meta?.kind ?? 'notice' ];

	return (
		<VStack spacing={ 4 }>
			<Layout note={ note } />
		</VStack>
	);
}
