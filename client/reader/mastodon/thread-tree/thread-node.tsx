import clsx from 'clsx';
import { forwardRef } from 'react';
import { SocialPostCard } from 'calypso/reader/social';
import { MastodonThreadTombstone } from './thread-tombstone';
import type { SocialThreadNode } from 'calypso/reader/social';

interface ThreadNodeProps {
	node: SocialThreadNode;
	depth: number;
	highlighted: boolean;
	expandedVideo?: boolean;
	prominentTimestamp?: boolean;
	connectionId?: number;
	// When false, render only the post row itself without recursing into
	// `node.replies`. Used by ThreadTree's parent chain so a parent's other
	// replies don't show up above the target post.
	renderReplies?: boolean;
}

// Visual indentation caps at 4 levels deep — past that, every reply renders
// at the same indent as a depth-4 node and gets a leading "↳" so the chain is
// still readable without drifting off-screen on narrow viewports.
const MAX_VISUAL_DEPTH = 4;

export const MastodonThreadNode = forwardRef< HTMLDivElement, ThreadNodeProps >(
	function MastodonThreadNode(
		{
			node,
			depth,
			highlighted,
			expandedVideo,
			prominentTimestamp,
			connectionId,
			renderReplies = true,
		},
		ref
	) {
		const isCapped = depth > MAX_VISUAL_DEPTH;
		const visualDepth = isCapped ? MAX_VISUAL_DEPTH : depth;
		const wrapperClass = clsx(
			'thread-node',
			`thread-node--depth-${ depth }`,
			isCapped && 'thread-node--capped'
		);
		const wrapperStyle = { '--thread-depth': visualDepth } as React.CSSProperties;
		if ( node.type === 'not_found' ) {
			return (
				<div className={ wrapperClass } style={ wrapperStyle }>
					<MastodonThreadTombstone kind="not_found" />
				</div>
			);
		}
		if ( node.type === 'blocked' ) {
			return (
				<div className={ wrapperClass } style={ wrapperStyle }>
					<MastodonThreadTombstone kind="blocked" />
				</div>
			);
		}
		return (
			<>
				<div
					ref={ highlighted ? ref : undefined }
					role="article"
					aria-current={ highlighted ? 'location' : undefined }
					className={ clsx( wrapperClass, highlighted && 'is-target' ) }
					style={ wrapperStyle }
				>
					<SocialPostCard
						post={ node.post }
						variant="default"
						expandedVideo={ expandedVideo }
						prominentTimestamp={ prominentTimestamp }
						connectionId={ connectionId }
					/>
				</div>
				{ renderReplies &&
					node.replies.map( ( reply, idx ) => (
						<MastodonThreadNode
							key={ reply.type === 'post' ? reply.post.uri : `${ reply.type }-${ idx }` }
							node={ reply }
							depth={ depth + 1 }
							highlighted={ false }
							connectionId={ connectionId }
						/>
					) ) }
			</>
		);
	}
);
