/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

export default ( { title } ) => {
	return (
		<span className="email-provider-details__feature">
			<Gridicon icon="checkmark" size="18" />

			{ preventWidows( title ) }
		</span>
	);
};
