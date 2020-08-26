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
	const tooltip = useTooltipState( { placement: 'top-end', gutter: 14 } );
	return (
		<>
			<TooltipReference { ...tooltip } ref={ children.ref } { ...children.props }>
				{ ( referenceProps ) => React.cloneElement( children, referenceProps ) }
			</TooltipReference>
			<ReakitTooltip { ...tooltip } { ...props }>
				<TooltipArrow className="tooltip__arrow" { ...tooltip } size={ 22 } />
				{ title }
			</ReakitTooltip>
		</>
	);
}

export default Tooltip;
