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
	useLayoutEffect,
	useRef,
	useReducer,
	useCallback,
} from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
// import BlockPreview from './block-preview';
import BlockTemplatePreview from './block-template-preview';

const THRESHOLD_RESIZE = 300;

const TemplateSelectorPreview = ( { blocks = [], viewportWidth, title } ) => {
	const ref = useRef( null );
	const [ previewViewport, setPreviewViewport ] = useState( viewportWidth );
	const [ recompute, triggerRecompute ] = useReducer( state => state + 1, 0 );

	const updatePreviewViewport = useCallback( () => {
		if ( ! ref || ! ref.current ) {
			return;
		}
		const wrapperWidth = ref.current.clientWidth;
		if ( wrapperWidth >= viewportWidth ) {
			setPreviewViewport( wrapperWidth );
		} else {
			setPreviewViewport( viewportWidth );
		}
	}, [ viewportWidth ] );

	useLayoutEffect( updatePreviewViewport, [ blocks ] );

	useEffect( () => {
		if ( blocks.length === 1 ) {
			return;
		}

		const rePreviewTemplate = () => {
			updatePreviewViewport();
			triggerRecompute();
		};

		const refreshPreview = debounce( rePreviewTemplate, THRESHOLD_RESIZE );
		window.addEventListener( 'resize', refreshPreview );

		// In wp-admin, listen to the jQuery `wp-collapse-menu` event to refresh the preview on sidebar toggle.
		if ( window.jQuery ) {
			window.jQuery( window.document ).on( 'wp-collapse-menu', rePreviewTemplate );
		}

		return () => {
			window.removeEventListener( 'resize', refreshPreview );
		};
	}, [ blocks, updatePreviewViewport ] );

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ `template-selector-preview ${ ! blocks.length ? 'not-selected' : '' }` }>
			<BlockTemplatePreview
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
				viewportWidth={ previewViewport }
			/>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
