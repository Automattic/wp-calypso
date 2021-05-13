/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Form from './form';
// import { isFeaturedProvider } from '../utils';

interface Props {
	host?: string;
}

const Credentials: FunctionComponent< Props > = () => {
	return <Form />;
};

export default Credentials;
