import clsx from 'clsx';
import SummaryButton from '../summary-button';
import type { SummaryButtonProps } from '@automattic/components/src/summary-button/types';

import './style.scss';

type SummaryItemProps = Omit<
	SummaryButtonProps,
	'href' | 'target' | 'rel' | 'onClick' | 'showArrow' | 'disabled'
>;

/**
 * A summary row that is only there to be read: it shows the same content as a
 * `SummaryButton`, but can't be clicked and isn't dimmed like a disabled one.
 */
export default function SummaryItem( { className, ...props }: SummaryItemProps ) {
	return (
		<SummaryButton
			{ ...props }
			className={ clsx( 'dashboard-summary-button', 'dashboard-summary-item', className ) }
			showArrow={ false }
			disabled
		/>
	);
}
