/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { debounce } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
import {
	useState,
	useEffect,
	useRef,
	useReducer,
} from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import BlockFramePreview from './block-iframe-preview';

const THRESHOLD_RESIZE = 300;

const TemplateSelectorPreview = ( { blocks = [], viewportWidth, title } ) => {
	const ref = useRef( null );
	const [ recompute, triggerRecompute ] = useReducer( state => state + 1, 0 );
	useEffect( () => {
		const refreshPreview = debounce( triggerRecompute, THRESHOLD_RESIZE );
		window.addEventListener( 'resize', refreshPreview );

		// In wp-admin, listen to the jQuery `wp-collapse-menu` event to refresh the preview on sidebar toggle.
		if ( window.jQuery ) {
			window.jQuery( window.document ).on( 'wp-collapse-menu', triggerRecompute );
		}

		return () => {
			window.removeEventListener( 'resize', refreshPreview );
		};
	}, [] );

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ `template-selector-preview ${ ! blocks.length ? 'not-selected' : '' }` }>

			<BlockFramePreview
				key={ recompute }
				blocks={
					! blocks.length
						? createBlock( 'core/paragraph', {
							content: __( 'Select a layout to preview.', 'full-site-editing' ),
						} )
						: [
								createBlock( 'core/heading', {
									content: title,
									align: 'center',
									level: 1,
								} ),
								...blocks,
						  ]
				}
				viewportWidth={ viewportWidth }
			/>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
