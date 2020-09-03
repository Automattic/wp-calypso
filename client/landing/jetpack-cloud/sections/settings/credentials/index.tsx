/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

interface Props {
	host: string;
}

const Credentials: FunctionComponent< Props > = ( { host } ) => {
	return <h3>{ `Host is ${ host }` }</h3>;
};

export default Credentials;
