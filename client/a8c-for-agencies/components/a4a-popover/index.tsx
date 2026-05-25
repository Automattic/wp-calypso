import { Popover } from '@wordpress/components';
import clsx from 'clsx';

import './style.scss';

interface Props {
	noArrow?: boolean;
	offset?: number;
	position?: React.ComponentProps< typeof Popover >[ 'position' ];
	/**
	 * Legacy prop kept for backward compatibility. The current
	 * `@wordpress/components` `Popover` no longer reads `context`, so this
	 * prop is effectively a no-op at runtime — existing call sites have
	 * always been anchoring via the popover's DOM render position. Prefer
	 * the `anchor` prop below for new code that needs explicit anchoring.
	 */
	wrapperRef?: React.MutableRefObject< HTMLElement | null >;
	/**
	 * Explicit element to anchor the popover to. When provided, the popover
	 * positions itself relative to this element rather than its DOM render
	 * position. Store the element in state (via a ref callback) so the
	 * popover repositions when the element mounts.
	 */
	anchor?: HTMLElement | null;
	title: string;
	className?: string;
	onFocusOutside: ( event: React.SyntheticEvent ) => void;
	children: React.ReactNode;
}

export default function A4APopover( {
	noArrow = false,
	offset = 0,
	position = 'bottom',
	anchor,
	title,
	className,
	onFocusOutside,
	children,
}: Props ) {
	return (
		<Popover
			isVisible
			noArrow={ noArrow }
			offset={ offset }
			className={ clsx( 'a4a-popover', className ) }
			anchor={ anchor ?? undefined }
			position={ position }
			onFocusOutside={ onFocusOutside }
		>
			<div className="a4a-popover__content">
				{ title && <div className="a4a-popover__title">{ title }</div> }
				{ children }
			</div>
		</Popover>
	);
}
