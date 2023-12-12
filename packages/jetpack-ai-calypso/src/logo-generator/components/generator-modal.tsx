/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import useLogo from '../hooks/use-logo';

export const GeneratorModal: React.FC = () => {
	const { message } = useLogo( {} );

	return <div>{ message }</div>;
};
