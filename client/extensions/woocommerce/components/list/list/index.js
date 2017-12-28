/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Card from 'client/components/card';

const List = ( { children } ) => {
	return (
		<Card className="list">
			<ul className="list__ul">{ children }</ul>
		</Card>
	);
};

export default List;
