import BlockPreview from '@wordpress/block-editor/build-module/components/block-preview';
import { parse as parseBlocks } from '@wordpress/blocks';
import React, { useMemo } from 'react';

export interface Props {
	html: string;
	viewportWidth: number;
}

const BlocksRenderer: React.FC< Props > = ( { html, viewportWidth } ) => {
	const blocks = useMemo( () => ( html ? parseBlocks( html ) : [] ), [ html ] );

	if ( ! html ) {
		return null;
	}

	return <BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />;
};

export default BlocksRenderer;
