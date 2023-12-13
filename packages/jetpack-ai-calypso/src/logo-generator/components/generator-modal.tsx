/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import useLogo from '../hooks/use-logo';
import './generator-modal.scss';

export const GeneratorModal: React.FC = () => {
	const { message } = useLogo( {} );

	return <div className="message">{ message }</div>;
};
