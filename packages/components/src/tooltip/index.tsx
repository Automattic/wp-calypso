import { Popover } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';

import '../popover/style.scss';
import './style.scss';

interface TooltipProps {
	autoPosition?: boolean;
	children?: React.ReactNode;
	className?: string;
	context?: any;
	hideArrow?: boolean;
	id?: string;
	isVisible?: boolean;
	position?: string;
	showDelay?: number;
	showOnMobile?: boolean;
	status?: string;
}

export default function Tooltip( {
	autoPosition,
	children,
	className,
	context,
	hideArrow = false,
	id,
	isVisible,
	position = 'top',
	showDelay = 100,
	showOnMobile = false,
	status,
}: TooltipProps ): JSX.Element | null {
	const isMobile = useMobileBreakpoint();

	if ( ! showOnMobile && isMobile ) {
		return null;
	}

	const classes = classnames( [ 'tooltip', className ], {
		[ `is-${ status }` ]: status,
	} );

	return (
		<Popover
			autoPosition={ autoPosition }
			className={ classes }
			context={ context }
			hideArrow={ hideArrow }
			id={ id }
			isVisible={ isVisible }
			position={ position }
			showDelay={ showDelay }
		>
			{ children }
		</Popover>
	);
}
