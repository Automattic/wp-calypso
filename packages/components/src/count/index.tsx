import './style.scss';

import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface CountProps extends HTMLAttributes< HTMLSpanElement > {
	count?: number;
	primary?: boolean;
	compact?: boolean;
	numberFormat?: ( count: number ) => string;
}

export function Count( {
	count = 0,
	primary,
	compact,
	numberFormat: numberFormatFromProps,
	className,
	...props
}: CountProps ) {
	const effectiveNumberFormat = numberFormatFromProps ?? formatNumber;

	return (
		<span className={ clsx( 'a8c-count', { 'is-primary': primary }, className ) } { ...props }>
			{ compact ? formatNumberCompact( count ) : effectiveNumberFormat( count ) }
		</span>
	);
}

export default Count;
