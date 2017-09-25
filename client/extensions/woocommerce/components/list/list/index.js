/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const List = ( { children } ) => {
	return (
		<Card className="list">
			<ul className="list__ul">
				{ children }
			</ul>
		</Card>
	);
};

export default List;
