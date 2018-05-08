/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HrWithText from '../index';

HrWithTextExample.displayName = 'HrWithText';

function HrWithTextExample( props ) {
	return props.exampleCode;
}

HrWithTextExample.defaultProps = {
	exampleCode: <HrWithText>This is some text</HrWithText>,
};

export default HrWithTextExample;
