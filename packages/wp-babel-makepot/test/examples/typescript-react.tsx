/**
 * External dependencies
 */
import React from 'react';

interface Props {
	translate: Function;
}

const Component: React.FunctionComponent< Props > = ( { translate } ) => (
	<div>{ translate( 'Typescript react component string' ) }</div>
);

export default Component;
