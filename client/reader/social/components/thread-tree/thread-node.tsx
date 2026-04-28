import clsx from 'clsx';
import { forwardRef } from 'react';
import { SocialPostCard } from '../post-card';
import { ThreadTombstone } from './thread-tombstone';
import type { AtmosphereThreadNode } from '@automattic/api-core';

interface ThreadNodeProps {
	node: AtmosphereThreadNode;
	depth: number;
	highlighted: boolean;
	expandedVideo?: boolean;
	prominentTimestamp?: boolean;
}

export const ThreadNode = forwardRef< HTMLDivElement, ThreadNodeProps >( function ThreadNode(
	{ node, depth, highlighted, expandedVideo, prominentTimestamp },
	ref
) {
	if ( node.type === 'not_found' ) {
		return (
			<div
				className={ clsx( 'thread-node', `thread-node--depth-${ depth }` ) }
				style={ { '--thread-depth': depth } as React.CSSProperties }
			>
				<ThreadTombstone kind="not_found" />
			</div>
		);
	}
	if ( node.type === 'blocked' ) {
		return (
			<div
				className={ clsx( 'thread-node', `thread-node--depth-${ depth }` ) }
				style={ { '--thread-depth': depth } as React.CSSProperties }
			>
				<ThreadTombstone kind="blocked" />
			</div>
		);
	}
	return (
		<>
			<div
				ref={ highlighted ? ref : undefined }
				role="article"
				aria-current={ highlighted ? 'true' : undefined }
				className={ clsx(
					'thread-node',
					`thread-node--depth-${ depth }`,
					highlighted && 'is-target'
				) }
				style={ { '--thread-depth': depth } as React.CSSProperties }
			>
				<SocialPostCard
					post={ node.post }
					variant="default"
					expandedVideo={ expandedVideo }
					prominentTimestamp={ prominentTimestamp }
				/>
			</div>
			{ node.replies.map( ( reply, idx ) => (
				<ThreadNode
					key={ reply.type === 'post' ? reply.post.uri : `${ reply.type }-${ idx }` }
					node={ reply }
					depth={ depth + 1 }
					highlighted={ false }
				/>
			) ) }
		</>
	);
} );
