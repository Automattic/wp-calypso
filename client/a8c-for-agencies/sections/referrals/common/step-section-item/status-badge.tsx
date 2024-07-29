import { Badge, Tooltip } from '@automattic/components';
import clsx from 'clsx';
import { useRef, useState, ComponentProps } from 'react';

import './style.scss';

export default function StatusBadge( {
	statusProps,
}: {
	statusProps?: ComponentProps< typeof Badge > & {
		tooltip?: string | JSX.Element;
		isRounded?: boolean;
	};
} ) {
	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLDivElement | null >( null );

	const { tooltip, isRounded, ...badgeProps } = statusProps || {};

	const badge = (
		<Badge
			className={ clsx( 'step-section-item__status', {
				'step-section-item__status--rounded': isRounded,
			} ) }
			{ ...badgeProps }
		/>
	);

	if ( ! tooltip ) {
		return <span className="step-section-item__status-wrapper">{ badge }</span>;
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
			{ badge }

			<Tooltip context={ wrapperRef.current } isVisible={ showPopover } position="bottom">
				{ tooltip }
			</Tooltip>
		</span>
	);
}
