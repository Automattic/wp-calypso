/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { AnglePickerControl } from '@wordpress/components';

const Example = () => {
	const [ angle, setAngle ] = useState();
	return <AnglePickerControl value={ angle } onChange={ setAngle } />;
};

export default Example;
