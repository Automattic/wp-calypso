/**
 * External dependencies
 */
import classnames from 'classnames';
/* eslint-disable import/no-extraneous-dependencies */
import { isEmpty, isArray, debounce } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
import { Disabled } from '@wordpress/components';
import { useState, useEffect, useLayoutEffect, useRef, useReducer } from '@wordpress/element';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import PreviewTemplateTitle from './preview-template-title';
import BlockPreview from './block-preview';

const TemplateSelectorPreview = ( { blocks, viewportWidth, title } ) => {
	const THRESHOLD_RESIZE = 300;

	const previewElClasses = classnames( 'template-selector-preview', 'editor-styles-wrapper' );
	const [ transform, setTransform ] = useState( 'none' );
	const [ visibility, setVisibility ] = useState( 'hidden' );
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
		setTimeout( () => {
			if ( ! ref || ! ref.current ) {
				return;
			}

			// Try to get the preview content element.
			const previewContainerEl = ref.current.querySelector(
				'.block-editor-block-preview__content'
			);
			if ( ! previewContainerEl ) {
				return;
			}

			// Try to get the `transform` css rule from the preview container element.
			const elStyles = window.getComputedStyle( previewContainerEl );
			if ( elStyles && elStyles.transform ) {
				setTransform( elStyles.transform ); // apply the same transform css rule to template title.
			}

			setVisibility( 'visible' );
		}, 300 );
	};

	useLayoutEffect( () => {
		setVisibility( 'hidden' );
		updateTemplateTitle();
	}, [ blocks ] );

	useEffect( () => {
		if ( ! blocks || ! blocks.length ) {
			return;
		}

		const rePreviewTemplate = () => {
			updateTemplateTitle();
			triggerRecompute();
		};

		const refreshPreview = debounce( rePreviewTemplate, THRESHOLD_RESIZE );
		window.addEventListener( 'resize', refreshPreview );

		return () => {
			window.removeEventListener( 'resize', refreshPreview );
		};
	}, [ blocks ] );

	if ( isEmpty( blocks ) || ! isArray( blocks ) ) {
		return (
			<div className={ previewElClasses }>
				<div className="template-selector-preview__placeholder">
					{ __( 'Select a page template to preview.', 'full-site-editing' ) }
				</div>
			</div>
		);
	}

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ previewElClasses }>
			<Disabled>
				<div ref={ ref } className="edit-post-visual-editor">
					<div className="editor-styles-wrapper" style={ { visibility } }>
						<div className="editor-writing-flow">
							<PreviewTemplateTitle title={ title } transform={ transform } />
							<BlockPreview key={ recompute } blocks={ blocks } viewportWidth={ viewportWidth } />
						</div>
					</div>
				</div>
			</Disabled>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
