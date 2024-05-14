import { Badge, Tooltip } from '@automattic/components';
import classNames from 'classnames';
import { useRef, useState, ComponentProps } from 'react';
import useTipaltiAccountStatus from 'calypso/a8c-for-agencies/hooks/tipalti/use-tipalti-account-status';

import './style.scss';

/**
 * Status Badge Frame Component
 *
 * Status badge component disconnected from application state.
 */
function StatusBadgeFrame( {
	statusProps,
	className,
}: {
	statusProps?: ComponentProps< typeof Badge > & { tooltip?: string };
	className?: string;
} ) {
	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLDivElement | null >( null );

	const { tooltip, ...badgeProps } = statusProps || {};

	if ( ! tooltip ) {
		return (
			<div className={ classNames( 'a4a-status-badge', className ) }>
				<Badge className="step-section-item__status" { ...badgeProps } />
			</div>
		);
	}

	return (
		<div
			className={ classNames( 'a4a-status-badge', className ) }
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
		</div>
	);
}

/**
 * Tipalti Status Badge
 *
 * Status badge component connected to application state.
 */
export default function StatusBadge( props: { className?: string } ) {
	const accountStatusQuery = useTipaltiAccountStatus();
	if ( ! accountStatusQuery.data ) {
		return null;
	}

	const {
		status: children,
		statusType: type,
		statusReason: tooltip,
	} = accountStatusQuery.data as {
		status: string;
		statusType: 'success' | 'warning' | 'error';
		statusReason?: string;
	};

	return <StatusBadgeFrame statusProps={ { children, type, tooltip } } { ...props } />;
}
