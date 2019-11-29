/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isEmpty, isArray, debounce } from 'lodash';
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

	const [ visibility, setVisibility ] = useState( 'hidden' );
	const [ previewViewport, setPreviewViewport ] = useState( viewportWidth );
	const ref = useRef( null );

	const [ recompute, triggerRecompute ] = useReducer( state => state + 1, 0 );

	// TODO: we should remove this approach and use the onReady callback.
	// There is Gutenberg PR which adds the onReady callback
	// as a component property.
	// The following approach can be easily replace calling this callback
	// once the PR ships (finger-crossed)
	// https://github.com/WordPress/gutenberg/pull/17242

	const updateTemplateTitle = () => {
		// Get DOM reference.
		if ( ! ref || ! ref.current ) {
			return;
		}

		// Try to get the preview content element.
		const previewContainerEl = ref.current.querySelector( '.block-editor-block-preview__content' );
		if ( ! previewContainerEl ) {
			return;
		}

		// Try to get the `transform` css rule from the preview container element.
		const elStyles = window.getComputedStyle( previewContainerEl );
		if ( elStyles && elStyles.transform ) {
			const titleElement = ref.current.querySelector( '.editor-post-title' );
			if ( titleElement ) {
				// Apply the same transform css rule at template title element.
				titleElement.style.transform = elStyles.transform;
			}

			// Pick up scale factor from `transform` css.
			let scale = elStyles.transform.replace( /matrix\((.+)\)$/i, '$1' ).split( ',' );
			scale = scale && scale.length ? Number( scale[ 0 ] ) : null;
			scale = isNaN( scale ) ? null : scale;

			// Try to adjust vertical offset of the large preview.
			const offsetCorrectionEl = previewContainerEl.closest(
				'.template-selector-preview__offset-correction'
			);

			if ( offsetCorrectionEl && scale ) {
				const titleHeight = titleElement ? titleElement.offsetHeight : null;
				offsetCorrectionEl.style.top = `${ titleHeight * scale }px`;
			}
		}

		setVisibility( 'visible' );
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
		setVisibility( 'hidden' );
		updatePreviewViewport();
		updateTemplateTitle();
	}, [ blocks, updatePreviewViewport ] );

	useEffect( () => {
		if ( ! blocks || ! blocks.length ) {
			return;
		}

		const rePreviewTemplate = () => {
			updateTemplateTitle();
			updatePreviewViewport();
			triggerRecompute();
		};

		const refreshPreview = debounce( rePreviewTemplate, THRESHOLD_RESIZE );
		window.addEventListener( 'resize', refreshPreview );

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
					<div className="editor-styles-wrapper" style={ { visibility } }>
						<div className="editor-writing-flow">
							<PreviewTemplateTitle title={ title } />
							<div className="template-selector-preview__offset-correction">
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
