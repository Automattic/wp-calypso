/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { __experimentalAlignmentMatrixControl as AlignmentMatrixControl } from '@wordpress/components';

const Example = () => {
	const [ alignment, setAlignment ] = useState( 'center center' );

	return <AlignmentMatrixControl value={ alignment } onChange={ setAlignment } />;
};

export default Example;
