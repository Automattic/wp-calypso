/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

export default ( { title } ) => {
	const deorphanedTitle =
		'string' === typeof title ? title.replace( /([^ ]) ([^ ]+)$/, '$1\u00a0$2' ) : title;
	return (
		<span className="email-provider-details__feature">
			<Gridicon icon="checkmark" size="18" />
			{ deorphanedTitle }
		</span>
	);
};
