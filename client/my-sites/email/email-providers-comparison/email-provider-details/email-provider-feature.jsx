/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';

export default ( { title } ) => {
	return (
		<span className="email-provider-details__feature">
			<Gridicon icon="checkmark" size="18" />
			{ title }
		</span>
	);
};
