/* eslint-disable react/no-danger  */
// documentation comes from endpoint and is sanitized

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const Setup = ( { documentation } ) => (
	<Card className="theme__sheet-content">
		<div dangerouslySetInnerHTML={ { __html: documentation } } />
	</Card>
);

export default Setup;
