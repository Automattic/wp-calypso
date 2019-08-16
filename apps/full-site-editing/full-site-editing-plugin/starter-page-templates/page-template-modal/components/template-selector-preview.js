/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import { Disabled } from '@wordpress/components';
/**
 * Internal dependencies
 */
import BlockPreview from './block-template-preview';

const TemplateSelectorPreview = ( { blocks, viewportWidth } ) => {
	// Used to hide the `BlockPreview` until we're confident
	// it's completed rendering. Ideally there would a way to detect
	// this but there isn't.
	const artificialLoadingDelay = 800;

	const previewContainerRef = useRef();

	const [ isLoading, setIsLoading ] = useState( false );

	useEffect( () => {
		// Reset scroll first to avoid flicker
		previewContainerRef.current.scrollTop = 0;
		setIsLoading( true );
		const timer = setTimeout( () => {
			setIsLoading( false );
		}, artificialLoadingDelay );

		return () => {
			setIsLoading( false );
			clearTimeout( timer );
		};
	}, [ blocks, viewportWidth ] );

	const loadingElClasses = classnames( 'template-selector-preview__loading', {
		'is-loading': isLoading,
	} );

	const previewElClasses = classnames( 'template-selector-preview', {
		'is-loaded': ! isLoading,
	} );

	if ( isEmpty( blocks ) ) {
		return (
			<div ref={ previewContainerRef } className="template-selector-preview">
				<div className="template-selector-preview__placeholder">
					{ __( 'Select a page template to preview.', 'full-site-editing' ) }
				</div>
			</div>
		);
	}

	return (
		<div ref={ previewContainerRef } className={ previewElClasses }>
			<div aria-hidden={ ! isLoading } className={ loadingElClasses }>
				Loading preview...
			</div>
			<Disabled>
				<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
			</Disabled>
		</div>
	);
};

export default TemplateSelectorPreview;
