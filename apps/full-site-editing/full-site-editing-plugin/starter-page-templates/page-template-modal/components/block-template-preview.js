/**
 * External dependencies
 */
import { castArray, noop } from 'lodash';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { Disabled } from '@wordpress/components';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { useMemo,  useLayoutEffect,  useReducer } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import TemplatePreviewFrame from './template-preview-frame';

function _BlockPreview( {
	blocks,
	settings,
	__experimentalOnReady = noop,
	__experimentalScalingDelay = 100,
} ) {
	const renderedBlocks = useMemo( () => castArray( blocks ), [ blocks ] );
	const [ recompute, triggerRecompute ] = useReducer( state => state + 1, 0 );
	useLayoutEffect( triggerRecompute, [ blocks ] );
	return (
		<BlockEditorProvider value={ renderedBlocks } settings={ settings }>
			<Disabled key={ recompute }>
				<BlockList />
			</Disabled>
		</BlockEditorProvider>
	);
}

const BlockPreview = withSelect( select => {
	return {
		settings: select( 'core/block-editor' ).getSettings(),
	};
} )( _BlockPreview );

const BlockTemplatePreview = ( { blocks = [], viewportWidth } ) => {
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<TemplatePreviewFrame
			viewportWidth={ viewportWidth }
			className="block-preview-iframe"
		>
			<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
		</TemplatePreviewFrame>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default BlockTemplatePreview;
