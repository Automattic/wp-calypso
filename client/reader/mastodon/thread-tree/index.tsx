import './style.scss';

import { __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect, useMemo, useRef } from 'react';
import { MastodonThreadNode } from './thread-node';
import type { SocialThreadNode } from 'calypso/reader/social';

const PARENT_WALK_LIMIT = 80;

interface MastodonThreadTreeProps {
	root: SocialThreadNode;
	targetUri: string;
	connectionId?: number;
}

// Mastodon-specific thread layout: parents stacked above the focal post
// (highlighted), descendants nested below. Mirrors the atmosphere
// ThreadTree's structure but takes SocialThreadNode (output of
// mapMastodonThreadResponseToSocialThreadNode) instead of
// AtmosphereThreadNode, so it can never accidentally consume Bluesky data.
export function MastodonThreadTree( { root, targetUri, connectionId }: MastodonThreadTreeProps ) {
	const targetRef = useRef< HTMLDivElement >( null );
	const parents = useMemo( () => flattenParents( root ), [ root ] );

	useEffect( () => {
		if ( parents.length > 0 && targetRef.current ) {
			targetRef.current.scrollIntoView( {
				block: 'start',
				behavior: 'instant',
			} );
		}
		// Intentional: only re-run on targetUri change. parents.length is
		// recomputed from root each render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ targetUri ] );

	return (
		<VStack spacing={ 0 } className="thread-tree">
			{ parents.map( ( parent, idx ) => (
				<MastodonThreadNode
					key={ keyOf( parent, `parent-${ idx }` ) }
					node={ parent }
					depth={ 0 }
					highlighted={ false }
					renderReplies={ false }
					connectionId={ connectionId }
				/>
			) ) }
			<MastodonThreadNode
				ref={ targetRef }
				node={ root }
				depth={ 0 }
				highlighted={ root.type === 'post' && root.post.uri === targetUri }
				expandedVideo
				prominentTimestamp
				connectionId={ connectionId }
			/>
		</VStack>
	);
}

function flattenParents( root: SocialThreadNode ): SocialThreadNode[] {
	const out: SocialThreadNode[] = [];
	const seen = new Set< string >();
	let cur: SocialThreadNode | null = root.type === 'post' ? root.parent : null;
	let guard = PARENT_WALK_LIMIT;
	while ( cur && guard-- > 0 ) {
		const uri = cur.type === 'post' ? cur.post.uri : cur.uri;
		if ( seen.has( uri ) ) {
			break;
		}
		seen.add( uri );
		out.push( cur );
		cur = cur.type === 'post' ? cur.parent : null;
	}
	return out.reverse();
}

function keyOf( node: SocialThreadNode, fallback: string ): string {
	switch ( node.type ) {
		case 'post':
			return node.post.uri;
		case 'not_found':
		case 'blocked':
			return `${ node.type }:${ node.uri }:${ fallback }`;
	}
}
