/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { castArray } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { withSelect } from '@wordpress/data';
import { compose, withSafeTimeout } from '@wordpress/compose';
import { useMemo } from '@wordpress/element';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
/* eslint-enable import/no-extraneous-dependencies */

const LayoutPreview = ( { blocks = [], settings } ) => {
	const renderedBlocks = useMemo( () => castArray( blocks ), [ blocks ] );

	return (
		<BlockEditorProvider value={ renderedBlocks } settings={ settings }>
			<BlockList />
		</BlockEditorProvider>
	);
};

export default compose(
	withSafeTimeout,
	withSelect( select => {
		const blockEditorStore = select( 'core/block-editor' );
		return {
			settings: blockEditorStore ? blockEditorStore.getSettings() : {},
		};
	} )
)( LayoutPreview );
