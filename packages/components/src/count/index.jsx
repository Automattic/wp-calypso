import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

import './style.scss';

export const Count = ( {
	count,
	primary = false,
	compact = false,
	forwardRef,
	numberFormat: numberFormatFromProps,
	translate,
	locale,
	...props
} ) => {
	const effectiveNumberFormat = numberFormatFromProps ?? formatNumber;

	return (
		<span ref={ forwardRef } className={ clsx( 'count', { 'is-primary': primary } ) } { ...props }>
			{ compact ? formatNumberCompact( count ) : effectiveNumberFormat( count ) }
		</span>
	);
};

Count.propTypes = {
	count: PropTypes.number.isRequired,
	numberFormat: PropTypes.func,
	primary: PropTypes.bool,
	compact: PropTypes.bool,
};

export default localize( Count );
