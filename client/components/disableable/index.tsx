/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Disabled } from '@wordpress/components';

const Disableable: React.FC = ( { children, disabled } ) => {
	const DisabledComponent = disabled ? Disabled : React.Fragment;
	return <DisabledComponent>{ children }</DisabledComponent>;
};

export default Disableable;
