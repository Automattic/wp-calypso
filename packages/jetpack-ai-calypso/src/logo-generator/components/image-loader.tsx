/**
 * External dependencies
 */
import classnames from 'classnames';
/**
 * Internal dependencies
 */
import loader from '../assets/images/loader.gif';
/**
 * Types
 */
import type React from 'react';

export const ImageLoader: React.FC< { className?: string } > = ( { className = null } ) => {
	return (
		<img
			src={ loader }
			alt="Loading"
			className={ classnames( 'jetpack-ai-logo-generator-modal__loader', className ) }
		/>
	);
};
