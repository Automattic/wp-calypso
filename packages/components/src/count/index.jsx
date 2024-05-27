import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import formatNumberCompact from './format-number-compact';

import './style.scss';

export const Count = ( {
	count,
	compact = false,
	numberFormat,
	forwardRef,
	primary = false,
	...rest
} ) => {
	// Omit props passed from the `localize` higher-order component that we don't need.
	const { translate, moment, ...inheritProps } = rest;

	return (
		<span
			ref={ forwardRef }
			className={ classnames( 'count', { 'is-primary': primary } ) }
			{ ...inheritProps }
		>
			{ compact ? formatNumberCompact( count ) || numberFormat( count ) : numberFormat( count ) }
		</span>
	);
};

Count.propTypes = {
	count: PropTypes.number.isRequired,
	numberFormat: PropTypes.func,
	primary: PropTypes.bool,
	compact: PropTypes.bool,
	refProp: PropTypes.oneOfType( [ PropTypes.func, PropTypes.shape( { current: PropTypes.any } ) ] ),
};

export default localize( Count );
