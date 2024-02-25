import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import classnames from 'classnames';
import i18n, { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

import './style.scss';

export const Count = ( { count, compact, numberFormat, forwardRef, primary, ...rest } ) => {
	// Omit props passed from the `localize` higher-order component that we don't need.
	const { translate, moment, ...inheritProps } = rest;

	return (
		<span
			ref={ forwardRef }
			className={ classnames( 'count', { 'is-primary': primary } ) }
			{ ...inheritProps }
		>
			{ compact
				? formatNumber( count, i18n.getLocaleSlug() ) || numberFormat( count )
				: numberFormat( count ) }
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
};

export default localize( Count );
