/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import React from 'react';
/**
 * Internal dependencies
 */
import { ImageLoader } from './image-loader';
import './first-load-screen.scss';

export const FirstLoadScreen: React.FC< {
	state?: 'loadingFeature' | 'analyzing' | 'generating';
} > = ( { state = 'loadingFeature' } ) => {
	const loadingLabel = __( 'Loading…', 'jetpack' );
	const analyzingLabel = __( 'Analyzing your site to create the perfect logo…', 'jetpack' );
	const generatingLabel = __( 'Generating logo…', 'jetpack' );

	return (
		<div className="jetpack-ai-logo-generator-modal__loading-wrapper">
			<ImageLoader />
			<span className="jetpack-ai-logo-generator-modal__loading-message">
				{ state === 'loadingFeature' && loadingLabel }
				{ state === 'analyzing' && analyzingLabel }
				{ state === 'generating' && generatingLabel }
			</span>
		</div>
	);
};
