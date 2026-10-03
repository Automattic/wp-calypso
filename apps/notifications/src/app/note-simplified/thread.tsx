import NoteIcon from '../note-icon';
import type { NoteView } from './note-view';
import type { ReactNode } from 'react';

const ThreadItem = ( {
	avatar,
	author,
	authorUrl,
	meta,
	children,
}: {
	avatar?: string;
	author?: string;
	authorUrl?: string;
	meta?: ReactNode;
	children: ReactNode;
} ) => {
	const photo = <NoteIcon className="wpnc-simplified__thread-marker" icon={ avatar } size={ 32 } />;

	return (
		<li className="wpnc-simplified__thread-item">
			{ authorUrl ? (
				// The name beside it links to the same profile, so the photo stays out of the tab order.
				<a href={ authorUrl } target="_blank" rel="noreferrer" tabIndex={ -1 } aria-hidden="true">
					{ photo }
				</a>
			) : (
				photo
			) }
			<div className="wpnc-simplified__thread-content">
				<div className="wpnc-simplified__thread-header">
					{ author && authorUrl && (
						<a
							className="wpnc-simplified__thread-author"
							href={ authorUrl }
							target="_blank"
							rel="noreferrer"
						>
							{ author }
						</a>
					) }
					{ author && ! authorUrl && (
						<span className="wpnc-simplified__thread-author">{ author }</span>
					) }
					{ meta && <span className="wpnc-simplified__meta">{ meta }</span> }
				</div>
				{ children }
			</div>
		</li>
	);
};

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
				<ThreadItem
					avatar={ parent.avatar }
					author={ parent.author }
					authorUrl={ parent.authorUrl }
					meta={ parentMeta }
				>
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
				<ThreadItem
					avatar={ speaker.avatar }
					author={ speaker.name }
					authorUrl={ speaker.url }
					meta={ meta }
				>
					{ children }
				</ThreadItem>
			) }
		</ol>
	);
}
