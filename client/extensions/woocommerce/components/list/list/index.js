/**
 * External dependencies
 */

import React from 'react';
import { Card } from '@automattic/components';

const List = ( { children } ) => {
	return (
		<Card className="list">
			<ul className="list__ul">{ children }</ul>
		</Card>
	);
};

export default List;
