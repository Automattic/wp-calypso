import clsx from 'clsx';
import { localize, numberFormat } from 'i18n-calypso';
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
	const effectiveNumberFormat = numberFormatFromProps ?? numberFormat;

	return (
		<span ref={ forwardRef } className={ clsx( 'count', { 'is-primary': primary } ) } { ...props }>
			{ compact ? numberFormat( count, { notation: 'compact' } ) : effectiveNumberFormat( count ) }
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
