import { Badge, Tooltip } from '@wordpress/ui';
import clsx from 'clsx';
import { ComponentProps, type JSX } from 'react';

import './style.scss';

export default function StatusBadge( {
	statusProps,
}: {
	statusProps?: ComponentProps< typeof Badge > & {
		tooltip?: string | JSX.Element;
		isRounded?: boolean;
	};
} ) {
	const { tooltip, isRounded, intent, children, className, ...restProps } = statusProps || {};

	const badge = (
		<Badge
			className={ clsx( 'step-section-item__status', className, {
				'step-section-item__status--rounded': isRounded,
			} ) }
			intent={ intent }
			{ ...restProps }
		>
			{ children ?? '' }
		</Badge>
	);

	if ( ! tooltip ) {
		return <span className="step-section-item__status-wrapper">{ badge }</span>;
	}

	return (
		<Tooltip.Root>
			<Tooltip.Trigger
				render={ ( triggerProps ) => (
					<span
						{ ...triggerProps }
						className={ clsx(
							'step-section-item__status-wrapper',
							triggerProps.className
						) }
					>
						{ badge }
					</span>
				) }
			/>
			<Tooltip.Popup positioner={ <Tooltip.Positioner side="bottom" /> }>
				{ tooltip }
			</Tooltip.Popup>
		</Tooltip.Root>
	);
}
