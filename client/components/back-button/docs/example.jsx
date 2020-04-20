/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BackButton from 'components/back-button';

const BackButtonExample = ( props ) => props.exampleCode;

BackButtonExample.displayName = 'BackButton';

BackButtonExample.defaultProps = {
	exampleCode: '<div className="back-button__example"><BackButton /></div>',
};

export default BackButtonExample;
