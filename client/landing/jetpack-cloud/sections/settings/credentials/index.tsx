/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

interface Props {
	host: string;
}

const Credentials: FunctionComponent< Props > = ( { host } ) => {
	return (
		<Card>
			<h3>{ `Host is ${ host }` }</h3>
		</Card>
	);
};

export default Credentials;
