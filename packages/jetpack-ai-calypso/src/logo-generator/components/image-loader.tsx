/**
 * Internal dependencies
 */
import loader from '../images/loader.gif';
/**
 * Types
 */
import type React from 'react';

export const ImageLoader: React.FC = () => {
	return <img src={ loader } alt="Loading" className="jetpack-ai-logo-generator-modal__loader" />;
};
