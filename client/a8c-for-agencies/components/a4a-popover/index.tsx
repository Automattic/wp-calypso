import { Popover } from '@wordpress/components';

import './style.scss';

interface Props {
	noArrow?: boolean;
	offset?: number;
	position?: React.ComponentProps< typeof Popover >[ 'position' ];
	wrapperRef: React.MutableRefObject< HTMLElement | null >;
	title: string;
	onFocusOutside: ( event: React.SyntheticEvent ) => void;
	children: React.ReactNode;
}

export default function A4APopover( {
	noArrow = false,
	offset = 0,
	position = 'bottom',
	wrapperRef,
	title,
	onFocusOutside,
	children,
}: Props ) {
	return (
		<Popover
			isVisible
			noArrow={ noArrow }
			offset={ offset }
			className="a4a-popover"
			context={ wrapperRef.current }
			position={ position }
			onFocusOutside={ onFocusOutside }
		>
			<div className="a4a-popover__content">
				<div className="a4a-popover__title">{ title }</div>
				{ children }
			</div>
		</Popover>
	);
}
