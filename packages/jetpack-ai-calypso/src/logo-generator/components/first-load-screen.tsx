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

export const FirstLoadScreen: React.FC = () => {
	return (
		<div className="jetpack-ai-logo-generator-modal__loading-wrapper">
			<ImageLoader />
			<span className="jetpack-ai-logo-generator-modal__loading-message">
				{ __( 'Analyzing your site to create the perfect logo…', 'jetpack' ) }
			</span>
		</div>
	);
};
