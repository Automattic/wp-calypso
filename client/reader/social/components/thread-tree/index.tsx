import './style.scss';

import { __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect, useRef } from 'react';
import { ThreadNode } from './thread-node';
import type { AtmosphereThreadNode } from '@automattic/api-core';

const PARENT_WALK_LIMIT = 80;

interface ThreadTreeProps {
	root: AtmosphereThreadNode;
	targetUri: string;
}

export function ThreadTree( { root, targetUri }: ThreadTreeProps ) {
	const targetRef = useRef< HTMLDivElement >( null );
	const parents = flattenParents( root );

	useEffect( () => {
		if ( parents.length > 0 && targetRef.current ) {
			targetRef.current.scrollIntoView( {
				block: 'start',
				behavior: 'instant',
			} );
		}
		// Scroll once on mount only; targetRef and parents.length settle on
		// first render and don't change for a given thread URL (next URL
		// produces a fresh ThreadTree instance via React Query cache key).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<VStack spacing={ 0 } className="thread-tree">
			{ parents.map( ( parent, idx ) => (
				<ThreadNode
					key={ keyOf( parent, `parent-${ idx }` ) }
					node={ parent }
					depth={ 0 }
					highlighted={ false }
				/>
			) ) }
			<ThreadNode
				ref={ targetRef }
				node={ root }
				depth={ 0 }
				highlighted={ root.type === 'post' && root.post.uri === targetUri }
				expandedVideo
			/>
		</VStack>
	);
}

function flattenParents( root: AtmosphereThreadNode ): AtmosphereThreadNode[] {
	const out: AtmosphereThreadNode[] = [];
	let cur: AtmosphereThreadNode | null = root.type === 'post' ? root.parent : null;
	let guard = PARENT_WALK_LIMIT;
	while ( cur && guard-- > 0 ) {
		out.push( cur );
		cur = cur.type === 'post' ? cur.parent : null;
	}
	return out.reverse();
}

function keyOf( node: AtmosphereThreadNode, fallback: string ): string {
	if ( node.type === 'post' ) {
		return node.post.uri;
	}
	return `${ node.type }:${ 'uri' in node ? node.uri : '' }:${ fallback }`;
}
