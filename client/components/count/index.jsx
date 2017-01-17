/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';

export const Count = ( { count, numberFormat, ...inheritProps } ) => (
	// Omit props passed from the `localize` higher-order component that we don't need.
	<span className="count" { ...omit( inheritProps, [ 'translate', 'moment' ] ) }>
		{ numberFormat( count ) }
	</span>
);

Count.propTypes = {
	count: React.PropTypes.number.isRequired,
	numberFormat: React.PropTypes.func
};

export default localize( Count );
