/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isEmpty, isArray, debounce } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
import { Disabled } from '@wordpress/components';
import { useState, useEffect, useReducer } from '@wordpress/element';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import PreviewTemplateTitle from './preview-template-title';
import BlockPreview from './block-preview';

const TemplateSelectorPreview = ( { blocks, viewportWidth, title } ) => {
	const THRESHOLD_RESIZE = 300;

	const [ visibility, setVisibility ] = useState( 'hidden' );
	const [ titleTransform, setTitleTransform ] = useState( 'scale(1)' );

	const [ recompute, triggerRecompute ] = useReducer( state => state + 1, 0 );

	useEffect( () => {
		if ( ! blocks || ! blocks.length ) {
			return;
		}

		const refreshPreview = debounce( triggerRecompute, THRESHOLD_RESIZE );
		window.addEventListener( 'resize', refreshPreview );

		return () => {
			window.removeEventListener( 'resize', refreshPreview );
		};
	}, [ blocks ] );

	if ( isEmpty( blocks ) || ! isArray( blocks ) ) {
		return (
			<div className="template-selector-preview editor-styles-wrapper">
				<div className="template-selector-preview__placeholder">
					{ __( 'Select a page template to preview.', 'full-site-editing' ) }
				</div>
			</div>
		);
	}

	const setTemplateTitle = ( { inlineStyles } ) => {
		setVisibility( 'visible' );
		setTitleTransform( inlineStyles.transform );
	};

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className="template-selector-preview editor-styles-wrapper">
			<Disabled>
				<div className="edit-post-visual-editor">
					<div className="editor-styles-wrapper" style={ { visibility } }>
						<div className="editor-writing-flow">
							<PreviewTemplateTitle title={ title } transform={ titleTransform } />
							<BlockPreview
								key={ recompute }
								blocks={ blocks }
								viewportWidth={ viewportWidth }
								__experimentalOnReady={ setTemplateTitle }
								__experimentalScalingDelay={ 0 }
							/>
						</div>
					</div>
				</div>
			</Disabled>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
