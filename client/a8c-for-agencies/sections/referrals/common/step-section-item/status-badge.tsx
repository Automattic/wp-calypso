import { Badge, Tooltip } from '@automattic/components';
import { useRef, useState, ComponentProps } from 'react';

import './style.scss';

export default function StatusBadge( {
	statusProps,
}: {
	statusProps?: ComponentProps< typeof Badge > & { tooltip?: string };
} ) {
	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLDivElement | null >( null );

	const { tooltip, ...badgeProps } = statusProps || {};

	if ( ! tooltip ) {
		return (
			<span className="step-section-item__status-wrapper">
				<Badge className="step-section-item__status" { ...badgeProps } />
			</span>
		);
	}

	return (
		<span
			className="step-section-item__status-wrapper"
			onMouseEnter={ () => setShowPopover( true ) }
			onMouseLeave={ () => setShowPopover( false ) }
			onMouseDown={ () => setShowPopover( false ) }
			role="button"
			tabIndex={ 0 }
			ref={ wrapperRef }
		>
			<Badge className="step-section-item__status" { ...badgeProps } />

			<Tooltip context={ wrapperRef.current } isVisible={ showPopover } position="bottom">
				{ tooltip }
			</Tooltip>
		</span>
	);
}
