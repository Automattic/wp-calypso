import { useMobileBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import Popover from '../popover';
import type { ReactNode } from 'react';

import './style.scss';

/** Popover resolves a context that exposes its node through getDOMNode(). */
type DOMNodeProvider = { getDOMNode: () => Element | null };

interface TooltipProps {
	autoPosition?: boolean;
	className?: string;
	id?: string;
	isVisible?: boolean;
	position?: string;
	status?: string;
	showDelay?: number;
	showOnMobile?: boolean;
	hideArrow?: boolean;
	focusOnShow?: boolean;
	children?: ReactNode;
	context?: Element | DOMNodeProvider | { current: Element | DOMNodeProvider | null } | null;
}

function Tooltip( {
	autoPosition = true,
	className,
	id,
	isVisible = false,
	position = 'top',
	status,
	showDelay = 100,
	showOnMobile = false,
	hideArrow = false,
	focusOnShow,
	children,
	context,
}: TooltipProps ) {
	const isMobile = useMobileBreakpoint();

	if ( ! showOnMobile && isMobile ) {
		return null;
	}

	const classes = clsx( [ 'tooltip', className ], {
		[ `is-${ status }` ]: status,
	} );

	return (
		<Popover
			autoPosition={ autoPosition }
			className={ classes }
			context={ context }
			focusOnShow={ focusOnShow }
			id={ id }
			isVisible={ isVisible }
			position={ position }
			showDelay={ showDelay }
			hideArrow={ hideArrow }
		>
			{ children }
		</Popover>
	);
}

export default Tooltip;
