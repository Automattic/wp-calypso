/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Style dependencies
 */
import './style.scss';

const ScreenReaderText: FunctionComponent = ( { children } ) => {
	return <span className="screen-reader-text">{ children }</span>;
};

export default ScreenReaderText;
