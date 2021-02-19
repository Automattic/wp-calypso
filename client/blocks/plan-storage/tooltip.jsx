/**
 * External dependencies
 */
import React from 'react';
import {
	useTooltipState,
	Tooltip as ReakitTooltip,
	TooltipReference,
	TooltipArrow,
} from 'reakit/Tooltip';

function Tooltip( { children, title, ...props } ) {
	const tooltipState = useTooltipState( { placement: 'top-end', gutter: 14 } );
	return (
		<>
			<TooltipReference { ...tooltipState } ref={ children.ref } { ...children.props }>
				{ ( referenceProps ) => React.cloneElement( children, referenceProps ) }
			</TooltipReference>
			<ReakitTooltip { ...tooltipState } { ...props }>
				<TooltipArrow className="tooltip__arrow" { ...tooltipState } size={ 22 } />
				{ title }
			</ReakitTooltip>
		</>
	);
}

export default Tooltip;
