/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import formatNumberCompact from 'lib/format-number-compact';

export const Count = ( { count, compact, numberFormat, primary, className, ...inheritProps } ) => {
	let formattedCount = count;
	// Only attempt to format the count if we've been handed a number
	if ( ! isNaN( count ) ) {
		formattedCount = compact
			? formatNumberCompact( count ) || numberFormat( count )
			: numberFormat( count );
	}

	return (
		// Omit props passed from the `localize` higher-order component that we don't need.
		<span
			className={ classnames( 'count', { 'is-primary': primary }, className ) }
			{ ...omit( inheritProps, [ 'translate', 'moment' ] ) }
		>
			{ formattedCount }
		</span>
	);
};

Count.propTypes = {
	count: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ).isRequired,
	numberFormat: PropTypes.func,
	primary: PropTypes.bool,
	compact: PropTypes.bool,
};

Count.defaultProps = {
	primary: false,
	compact: false,
};

export default localize( Count );
