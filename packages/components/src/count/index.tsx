import './style.scss';

import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import clsx from 'clsx';

interface CountProps {
	count: number;
	primary?: boolean;
	compact?: boolean;
	forwardRef?: React.Ref< HTMLSpanElement >;
	numberFormat?: ( count: number ) => string;
}

function Count( props: CountProps ): JSX.Element {
	const { count, forwardRef, numberFormat: numberFormatFromProps } = props;
	const effectiveNumberFormat = numberFormatFromProps ?? formatNumber;

	return (
		<span ref={ forwardRef } className={ clsx( 'a8c-count', { 'is-primary': props.primary } ) }>
			{ props.compact ? formatNumberCompact( count ) : effectiveNumberFormat( count ) }
		</span>
	);
}

export default Count;
