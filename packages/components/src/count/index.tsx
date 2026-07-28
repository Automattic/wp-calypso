import './style.scss';

import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import clsx from 'clsx';
import { HTMLAttributes, useRef, useState } from 'react';
import Tooltip from '../tooltip';

interface CountProps extends HTMLAttributes< HTMLSpanElement > {
	count?: number;
	primary?: boolean;
	compact?: boolean;
	numberFormat?: ( count: number ) => string;
	tooltipText?: string; // Text explaining what the count represents.
}

export function Count( {
	count = 0,
	primary,
	compact,
	numberFormat: numberFormatFromProps,
	tooltipText,
	className,
	tabIndex,
	'aria-label': ariaLabel,
	...props
}: CountProps ) {
	const spanRef = useRef< HTMLSpanElement >( null );
	const [ isTooltipVisible, setIsTooltipVisible ] = useState( false );
	const effectiveNumberFormat = numberFormatFromProps ?? formatNumber;

	const handleMouseEnter = () => setIsTooltipVisible( true );
	const handleMouseLeave = () => setIsTooltipVisible( false );
	const handleFocus = () => setIsTooltipVisible( true );
	const handleBlur = () => setIsTooltipVisible( false );

	return (
		<>
			<span
				className={ clsx( 'a8c-count', { 'is-primary': primary }, className ) }
				ref={ spanRef }
				aria-label={ ariaLabel }
				tabIndex={ tabIndex }
				onMouseEnter={ tooltipText ? handleMouseEnter : undefined }
				onMouseLeave={ tooltipText ? handleMouseLeave : undefined }
				onFocus={ tooltipText ? handleFocus : undefined }
				onBlur={ tooltipText ? handleBlur : undefined }
				{ ...props }
			>
				{ compact ? formatNumberCompact( count ) : effectiveNumberFormat( count ) }
			</span>

			{ tooltipText && (
				<Tooltip
					context={ spanRef.current }
					focusOnShow={ false }
					isVisible={ isTooltipVisible }
					showDelay={ 500 }
				>
					{ tooltipText }
				</Tooltip>
			) }
		</>
	);
}

export default Count;
