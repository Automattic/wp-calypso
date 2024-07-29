import { Popover } from '@wordpress/components';
import clsx from 'clsx';

import './style.scss';

interface Props {
	noArrow?: boolean;
	offset?: number;
	position?: React.ComponentProps< typeof Popover >[ 'position' ];
	wrapperRef: React.MutableRefObject< HTMLElement | null >;
	title: string;
	className?: string;
	onFocusOutside: ( event: React.SyntheticEvent ) => void;
	children: React.ReactNode;
}

export default function A4APopover( {
	noArrow = false,
	offset = 0,
	position = 'bottom',
	wrapperRef,
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
			context={ wrapperRef.current }
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
