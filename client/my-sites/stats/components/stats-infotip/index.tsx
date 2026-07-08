import { info } from '@wordpress/icons';
import { Icon, Popover, VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import './style.scss';

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
	return (
		<span className={ clsx( 'stats-infotip', className ) }>
			<Popover.Root>
				<Popover.Trigger
					type="button"
					openOnHover
					delay={ 200 }
					closeDelay={ 200 }
					aria-label={ label }
					className={ clsx( 'stats-infotip__trigger', triggerClassName ) }
				>
					<Icon icon={ info } size={ iconSize } />
				</Popover.Trigger>
				<Popover.Popup
					className={ clsx( 'stats-infotip__popup', popupClassName ) }
					positioner={
						<Popover.Positioner
							className="stats-infotip__positioner"
							side={ side }
							align={ align }
							sideOffset={ 8 }
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
