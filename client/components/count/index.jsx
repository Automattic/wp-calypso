import classnames from 'classnames';
import PropTypes from 'prop-types';
import formatNumberCompact from 'calypso/lib/format-number-compact';

import './style.scss';

export const Count = ( { count, compact, numberFormat, forwardRef, primary, ...inheritProps } ) => {
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

Count.defaultProps = {
	primary: false,
	compact: false,
	numberFormat: ( i ) => i,
};

export default Count;
