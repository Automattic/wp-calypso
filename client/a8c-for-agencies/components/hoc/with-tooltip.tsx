import { Tooltip } from '@automattic/components';
import { ComponentType, useRef, useState } from 'react';

export type WithTooltipProps = {
	tooltip?: string;
	tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
};

export function withTooltip< T extends WithTooltipProps >( WrappedComponent: ComponentType< T > ) {
	return function WithTooltipWrapper( props: T ) {
		const { tooltip, tooltipPosition = 'top', ...rest } = props;
		const elementRef = useRef< HTMLDivElement >( null );
		const [ isTooltipVisible, setIsTooltipVisible ] = useState( false );

		if ( ! tooltip ) {
			return <WrappedComponent { ...( rest as T ) } />;
		}

		return (
			<>
				<div
					className="with-tooltip-wrapper"
					ref={ elementRef }
					onMouseEnter={ () => setIsTooltipVisible( true ) }
					onMouseLeave={ () => setIsTooltipVisible( false ) }
				>
					<WrappedComponent { ...( rest as T ) } />
				</div>
				<Tooltip
					context={ elementRef.current }
					isVisible={ isTooltipVisible }
					position={ tooltipPosition }
					showOnMobile
				>
					{ tooltip }
				</Tooltip>
			</>
		);
	};
}
