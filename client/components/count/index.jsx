/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

export const Count = ( { count, numberFormat, primary, ...inheritProps } ) => (
	// Omit props passed from the `localize` higher-order component that we don't need.
	<span
		className={ classnames( 'count', { 'is-primary': primary } ) }
		{ ...omit( inheritProps, [ 'translate', 'moment' ] ) }
	>
		{ numberFormat( count ) }
	</span>
);

Count.propTypes = {
	count: PropTypes.number.isRequired,
	numberFormat: PropTypes.func,
	primary: PropTypes.bool,
};

Count.defaultProps = {
	primary: false,
};

export default localize( Count );
