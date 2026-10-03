import NoteIcon from '../note-icon';
import type { NoteView } from './note-view';
import type { ReactNode } from 'react';

const ThreadItem = ( {
	avatar,
	author,
	meta,
	children,
}: {
	avatar?: string;
	author?: string;
	meta?: ReactNode;
	children: ReactNode;
} ) => (
	<li className="wpnc-simplified__thread-item">
		<NoteIcon className="wpnc-simplified__thread-marker" icon={ avatar } size={ 32 } />
		<div className="wpnc-simplified__thread-content">
			<div className="wpnc-simplified__thread-header">
				{ author && <span className="wpnc-simplified__thread-author">{ author }</span> }
				{ meta && <span className="wpnc-simplified__meta">{ meta }</span> }
			</div>
			{ children }
		</div>
	</li>
);

/**
 * The conversation a note belongs to, oldest first: the comment being answered or
 * liked, then the new comment, passed as children.
 */
export default function Thread( {
	thread: { parent, speaker },
	meta,
	parentMeta,
	children,
}: {
	thread: NonNullable< NoteView[ 'thread' ] >;
	/** When the new comment was made, and anything else worth knowing about its author. */
	meta: ReactNode;
	parentMeta?: ReactNode;
	children: ReactNode;
} ) {
	return (
		<ol className="wpnc-simplified__thread">
			{ parent && (
				<ThreadItem avatar={ parent.avatar } author={ parent.author } meta={ parentMeta }>
					{ parent.url ? (
						<a href={ parent.url } target="_blank" rel="noreferrer">
							{ parent.text }
						</a>
					) : (
						parent.text
					) }
				</ThreadItem>
			) }
			{ speaker && (
				<ThreadItem avatar={ speaker.avatar } author={ speaker.name } meta={ meta }>
					{ children }
				</ThreadItem>
			) }
		</ol>
	);
}
