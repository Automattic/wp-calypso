/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { debounce, get, isArray, isEmpty } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
import { Disabled } from '@wordpress/components';
import {
	useState,
	useEffect,
	useLayoutEffect,
	useRef,
	useReducer,
	useCallback,
} from '@wordpress/element';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import PreviewTemplateTitle from './preview-template-title';
import BlockPreview from './block-preview';

const TemplateSelectorPreview = ( { blocks, viewportWidth, title } ) => {
	const THRESHOLD_RESIZE = 300;
	const TITLE_DEFAULT_HEIGHT = 120;

	const ref = useRef( null );

	const [ previewViewport, setPreviewViewport ] = useState( viewportWidth );
	const [ titleTransform, setTitleTransform ] = useState( {
		scale: 1,
		offset: TITLE_DEFAULT_HEIGHT,
	} );
	const [ recompute, triggerRecompute ] = useReducer( state => state + 1, 0 );

	const updatePreviewTitle = () => {
		if ( ! ref || ! ref.current ) {
			return;
		}

		setTimeout( () => {
			const preview = ref.current.querySelector( '.block-editor-block-preview__content' );
			if ( ! preview ) {
				return;
			}

			const previewScale = parseFloat(
				get( preview, [ 'style', 'transform' ], '' )
					.replace( 'scale(', '' )
					.replace( ')', '' )
			);
			if ( previewScale ) {
				const titleOffset = TITLE_DEFAULT_HEIGHT * previewScale;
				setTitleTransform( { scale: previewScale, offset: titleOffset } );
			}
		}, 500 );
	};

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

	useLayoutEffect( () => {
		updatePreviewViewport();
		updatePreviewTitle();
	}, [ blocks, updatePreviewViewport ] );

	useEffect( () => {
		if ( ! blocks || ! blocks.length ) {
			return;
		}

		const rePreviewTemplate = () => {
			updatePreviewViewport();
			updatePreviewTitle();
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

	if ( isEmpty( blocks ) || ! isArray( blocks ) ) {
		return (
			<div className={ classnames( 'template-selector-preview', 'is-blank-preview' ) }>
				<div className="template-selector-preview__placeholder">
					{ __( 'Select a layout to preview.', 'full-site-editing' ) }
				</div>
			</div>
		);
	}

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className="template-selector-preview">
			<Disabled>
				<div ref={ ref } className="edit-post-visual-editor">
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow">
							<PreviewTemplateTitle title={ title } scale={ titleTransform.scale } />
							<div
								className="template-selector-preview__offset-correction"
								style={ { top: titleTransform.offset } }
							>
								<BlockPreview
									key={ recompute }
									blocks={ blocks }
									viewportWidth={ previewViewport }
								/>
							</div>
						</div>
					</div>
				</div>
			</Disabled>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
