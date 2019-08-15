/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockPreview from './block-template-preview';

const TemplateSelectorPreview = ( { blocks, viewportWidth } ) => {
	// Used to hide the `BlockPreview` until we're confident
	// it's completed rendering. Ideally there would a way to detect
	// this but there isn't.
	const artificialLoadingDelay = 800;

	const [ isLoading, setIsLoading ] = useState( false );

	useEffect( () => {
		setIsLoading( true );
		const timer = setTimeout( () => {
			setIsLoading( false );
		}, artificialLoadingDelay );

		return () => {
			setIsLoading( false );
			clearTimeout( timer );
		};
	}, [ blocks, viewportWidth ] );

	return (
		<div className="template-selector-preview">
			{ isEmpty( blocks ) ? (
				<div className="template-selector-preview__placeholder">
					{ __( 'Select a page template to preview.', 'full-site-editing' ) }
				</div>
			) : (
				<>
					{ isLoading && (
						<div className="template-selector-preview__loading">Loading preview...</div>
					) }
					<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
				</>
			) }
		</div>
	);
};

export default TemplateSelectorPreview;
