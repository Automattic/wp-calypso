/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { identity, omit } from 'lodash';

const Count = ( { count, numberFormat, ...inheritProps } ) => (
	<span className="count" { ...omit( inheritProps, [ 'translate', 'moment' ] ) }>
		{ numberFormat( count ) }
	</span>
);

Count.propTypes = {
	count: React.PropTypes.number.isRequired,
	numberFormat: React.PropTypes.func
};

Count.defaultProps = {
	numberFormat: identity
};

export default localize( Count );
