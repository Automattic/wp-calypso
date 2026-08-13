import { info } from '@wordpress/icons';
import { Icon, Popover, VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import { useRef } from 'react';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';

import './style.scss';

// --wpds-motion-duration-md; matches the WPDS motion scale for menus/popovers.
const HOVER_DELAY_MS = 200;

// --wpds-dimension-gap-sm
const POPUP_SIDE_OFFSET_PX = 8;

type StatsInfotipProps = {
	children: ReactNode;
	className?: string;
	iconSize?: number;
	label: string;
	popupClassName?: string;
	side?: ComponentProps< typeof Popover.Positioner >[ 'side' ];
	align?: ComponentProps< typeof Popover.Positioner >[ 'align' ];
	triggerClassName?: string;
};

function handleTriggerClick( event: MouseEvent< HTMLButtonElement > ) {
	event.preventDefault();
	event.stopPropagation();
}

export default function StatsInfotip( {
	children,
	className,
	iconSize = 20,
	label,
	popupClassName,
	side = 'top',
	align = 'center',
	triggerClassName,
}: StatsInfotipProps ) {
	const customTheme = useWPAdminTheme();
	const triggerRef = useRef< HTMLButtonElement >( null );

	return (
		<span className={ clsx( 'stats-infotip', className ) }>
			<Popover.Root>
				<Popover.Trigger
					ref={ triggerRef }
					type="button"
					openOnHover
					delay={ HOVER_DELAY_MS }
					closeDelay={ HOVER_DELAY_MS }
					aria-label={ label }
					className={ clsx( 'stats-infotip__trigger', triggerClassName ) }
					onClick={ handleTriggerClick }
				>
					<Icon icon={ info } size={ iconSize } />
				</Popover.Trigger>
				<Popover.Popup
					className={ clsx(
						'stats-infotip__popup',
						popupClassName,
						customTheme && `color-scheme ${ customTheme }`
					) }
					positioner={
						<Popover.Positioner
							className="stats-infotip__positioner"
							side={ side }
							align={ align }
							sideOffset={ POPUP_SIDE_OFFSET_PX }
							// wp-admin's fixed left side nav isn't a clipping ancestor of the popup
							// (it's a sibling, not an overflow:hidden container), so the default
							// 'clipping-ancestors' collision boundary never sees it and the popup
							// can render underneath it. Point collision detection at the actual
							// content area instead, same as DateRange does for its own Popover.
							collisionBoundary={
								triggerRef.current?.closest( '.main, #wpcontent, .layout__content' ) ?? undefined
							}
						/>
					}
				>
					<Popover.Arrow />
					<VisuallyHidden render={ <Popover.Title /> }>{ label }</VisuallyHidden>
					<Popover.Description className="stats-infotip__description" render={ <div /> }>
						{ children }
					</Popover.Description>
				</Popover.Popup>
			</Popover.Root>
		</span>
	);
}
