import React, { useMemo } from 'react';
import useQueryRenderedPatterns from '../hooks/use-query-rendered-patterns';
import BlocksRenderer from './blocks-renderer';

interface Props {
	siteId: number;
	stylesheet: string;
	patternId: string;
	viewportWidth?: number;
}

const PatternRenderer = ( { siteId, stylesheet, patternId, viewportWidth = 1060 }: Props ) => {
	const patternIds = useMemo( () => [ patternId ], [ patternId ] );
	const { data: patterns } = useQueryRenderedPatterns( siteId, stylesheet, patternIds );

	if ( ! patterns ) {
		return null;
	}

	return (
		<BlocksRenderer
			html={ patterns[ 0 ].html }
			styles={ patterns[ 0 ].styles }
			viewportWidth={ viewportWidth }
		/>
	);
};

export default PatternRenderer;
