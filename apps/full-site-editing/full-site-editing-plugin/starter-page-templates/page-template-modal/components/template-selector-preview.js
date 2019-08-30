/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockPreview } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { useState, useLayoutEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import PreviewTemplateTitle from './preview-template-title';

const TemplateSelectorPreview = ( { blocks, viewportWidth, title } ) => {
	const previewElClasses = classnames( 'template-selector-preview', 'editor-styles-wrapper' );
	const [ transform, setTransform ] = useState( 'none' );
	const [ visibility, setVisibility ] = useState( 'hidden' );
	const ref = useRef( null );

	// TODO: we should remove this approach and use the onReady callback.
	// There is Gutenberg PR which adds the onReady callback
	// as a component property.
	// The following approach can be easily replace calling this callback
	// once the PR ships (finger-crossed)
	// https://github.com/WordPress/gutenberg/pull/17242
	useLayoutEffect( () => {
		setVisibility( 'hidden' );

		setTimeout( () => {
			// Get DOM reference.
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
	}, [ blocks ] );

	if ( isEmpty( blocks ) ) {
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
							<div className="editor-block-list__layout">
								<div className="block-editor-block-list__block-edit">
									<PreviewTemplateTitle title={ title } transform={ transform } />
									<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
								</div>
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
