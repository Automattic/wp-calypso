import './style.scss';

import { __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect, useMemo, useRef } from 'react';
import { ThreadNode } from './thread-node';
import type { AtmosphereThreadNode } from '@automattic/api-core';

const PARENT_WALK_LIMIT = 80;

interface ThreadTreeProps {
	root: AtmosphereThreadNode;
	targetUri: string;
	connectionId: number;
}

export function ThreadTree( { root, targetUri, connectionId }: ThreadTreeProps ) {
	const targetRef = useRef< HTMLDivElement >( null );
	const parents = useMemo( () => flattenParents( root ), [ root ] );

	useEffect( () => {
		if ( parents.length > 0 && targetRef.current ) {
			targetRef.current.scrollIntoView( {
				block: 'start',
				behavior: 'instant',
			} );
		}
		// Intentional: only re-run on targetUri change. parents.length is recomputed from root each render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ targetUri ] );

	return (
		<VStack spacing={ 0 } className="thread-tree">
			{ parents.map( ( parent, idx ) => (
				<ThreadNode
					key={ keyOf( parent, `parent-${ idx }` ) }
					node={ parent }
					depth={ 0 }
					highlighted={ false }
					renderReplies={ false }
					connectionId={ connectionId }
				/>
			) ) }
			<ThreadNode
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

function flattenParents( root: AtmosphereThreadNode ): AtmosphereThreadNode[] {
	const out: AtmosphereThreadNode[] = [];
	const seen = new Set< string >();
	let cur: AtmosphereThreadNode | null = root.type === 'post' ? root.parent : null;
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

function keyOf( node: AtmosphereThreadNode, fallback: string ): string {
	switch ( node.type ) {
		case 'post':
			return node.post.uri;
		case 'not_found':
		case 'blocked':
			return `${ node.type }:${ node.uri }:${ fallback }`;
	}
}
