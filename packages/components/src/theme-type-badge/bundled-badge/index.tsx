import clsx from 'clsx';
import { type FunctionComponent, useRef, useMemo, useState } from 'react';
import Popover from '../../popover';

import './style.scss';

interface Props {
	className?: string;
	color: string;
	icon?: React.ReactElement;
	tooltipContent?: React.ReactElement;
	tooltipClassName?: string;
	tooltipPosition?: string;
	focusOnShow?: boolean;
	isClickable?: boolean;
	shouldHideTooltip?: boolean;
	children?: React.ReactNode;
}

const BundledBadge: FunctionComponent< Props > = ( {
	className,
	color,
	icon,
	tooltipContent,
	tooltipClassName,
	tooltipPosition = 'bottom right',
	focusOnShow,
	isClickable,
	shouldHideTooltip,
	children,
} ) => {
	const divRef = useRef( null );
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );
	const [ isPressed, setIsPressed ] = useState( false );

	const isClickableProps = useMemo( () => {
		if ( ! isClickable ) {
			return {};
		}

		return {
			role: 'button',
			tabIndex: 0,
			onBlur: () => {
				setIsPressed( false );
				setIsPopoverVisible( false );
			},
			onClick: () => {
				setIsPressed( ! isPopoverVisible );
				setIsPopoverVisible( ! isPopoverVisible );
			},
			onKeyDown: ( event: React.KeyboardEvent ) => {
				if ( event.key === 'Enter' || event.key === ' ' ) {
					event.preventDefault();
					setIsPressed( ! isPopoverVisible );
					setIsPopoverVisible( ! isPopoverVisible );
				}
			},
		};
	}, [ isClickable, isPopoverVisible ] );

	return (
		<div
			className={ clsx( 'bundled-badge', className, {
				'bundled-badge--is-clickable': isClickable,
			} ) }
			style={ { backgroundColor: color } }
			ref={ divRef }
			onMouseEnter={ () => {
				if ( ! isPressed ) {
					setIsPopoverVisible( true );
				}
			} }
			onMouseLeave={ () => {
				if ( ! isPressed ) {
					setIsPopoverVisible( false );
				}
			} }
			{ ...isClickableProps }
		>
			{ icon && <span className="bundled-badge__icon">{ icon }</span> }
			<span>{ children }</span>
			{ ! shouldHideTooltip && (
				<Popover
					className={ clsx( 'bundled-badge__popover', tooltipClassName ) }
					context={ divRef.current }
					isVisible={ isPopoverVisible }
					position={ tooltipPosition }
					focusOnShow={ focusOnShow }
				>
					{ tooltipContent }
				</Popover>
			) }
		</div>
	);
};

export default BundledBadge;
