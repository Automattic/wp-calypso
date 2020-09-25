/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { __experimentalAlignmentMatrixControl as AlignmentMatrixControl } from '@wordpress/components';

const AlignmentMatrixControlExample = () => {
	const [ alignment, setAlignment ] = useState( 'center center' );

	return <AlignmentMatrixControl value={ alignment } onChange={ setAlignment } />;
};

export default AlignmentMatrixControlExample;
