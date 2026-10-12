import { __experimentalVStack as VStack } from '@wordpress/components';
import { getNoteKind } from './kind';
import CommentNote from './layouts/comment';
import NewPostNote from './layouts/new-post';
import NoticeNote from './layouts/notice';
import ReactionsNote from './layouts/reactions';
import type { NoteKind } from './kind';
import type { Note } from '../types';
import type { ComponentType } from 'react';
import './style.scss';

const LAYOUTS: Record< NoteKind, ComponentType< { note: Note } > > = {
	comment: CommentNote,
	'new-post': NewPostNote,
	reactions: ReactionsNote,
	notice: NoticeNote,
};

export default function SimplifiedNote( { note }: { note: Note } ) {
	const Layout = LAYOUTS[ getNoteKind( note ) ];

	return (
		<VStack className="wpnc-simplified" spacing={ 4 }>
			<Layout note={ note } />
		</VStack>
	);
}
