/**
 * External dependencies
 */
import { each, get, filter, castArray, noop } from 'lodash';
import classnames from 'classnames';
``;

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { Disabled } from '@wordpress/components';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import {
	useCallback,
	Fragment,
	useMemo,
	useLayoutEffect,
	useRef,
	useState,
	useReducer,
	useEffect,
	Component,
} from '@wordpress/element';
import { withSelect } from '@wordpress/data';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import TemplatePreviewFrame from './template-preview-frame';

export function getBlockDOMNode( clientId ) {
	return document.getElementById( 'block-' + clientId );
}

export function getBlockPreviewContainerDOMNode( clientId ) {
	const domNode = getBlockDOMNode( clientId );

	if ( ! domNode ) {
		return;
	}

	return domNode.firstChild || domNode;
}

const getInlineStyles = ( scale, x, y, isReady, width ) => ( {
	transform: `scale(${ scale })`,
	visibility: isReady ? 'visible' : 'hidden',
	left: x,
	top: y,
	width,
} );

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
	const iFrameRef = useRef();
	const [ scale, setScale ] = useState( 1 );
	useEffect( () => {
		console.log( 'component is mount' );
		if ( ! iFrameRef ) {
			return;
		}

		// Get iFrame width;
		const { current: iFrameElement } = iFrameRef;
		const iFrameWidth = get( iFrameElement, [ 'node', 'offsetWidth' ] );

		if ( ! iFrameWidth ) {
			return;
		}
		console.log( { iFrameWidth } );

		const templatePreviewWidth = get( iFrameElement, [ 'node', 'parentElement', 'offsetWidth' ] );
		if ( ! templatePreviewWidth ) {
			return;
		}
		setScale( templatePreviewWidth / iFrameWidth );
	}, [ blocks ] );
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<TemplatePreviewFrame
			ref={ iFrameRef }
			style={ {
				transform: `scale(${ scale })`,
			} }
			className="block-preview-iframe"
		>
			<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
		</TemplatePreviewFrame>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default BlockTemplatePreview;
