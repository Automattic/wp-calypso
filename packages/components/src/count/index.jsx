import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import formatNumberCompact from './format-number-compact';

import './style.scss';

export const Count = ( {
	count,
	primary = false,
	compact = false,
	forwardRef,
	numberFormat,
	translate,
	locale,
	...props
} ) => {
	return (
		<span ref={ forwardRef } className={ clsx( 'count', { 'is-primary': primary } ) } { ...props }>
			{ compact ? formatNumberCompact( count ) || numberFormat( count ) : numberFormat( count ) }
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
