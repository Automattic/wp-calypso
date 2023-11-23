import classNames from 'classnames';
import { FunctionComponent, useRef, useMemo, useState } from 'react';
import Popover from '../../popover';

import './style.scss';

interface Props {
	className?: string;
	icon?: React.ReactElement;
	tooltipContent?: React.ReactElement;
	tooltipClassName?: string;
	tooltipPosition?: string;
	focusOnShow?: boolean;
	isClickable?: boolean;
	children?: React.ReactNode;
}

const BundledBadge: FunctionComponent< Props > = ( {
	className,
	icon,
	tooltipContent,
	tooltipClassName,
	tooltipPosition = 'bottom right',
	focusOnShow,
	isClickable,
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
			className={ classNames( 'bundled-badge', className, {
				'bundled-badge--is-clickable': isClickable,
			} ) }
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
			{ icon }
			<span>{ children }</span>
			<Popover
				className={ classNames( 'bundled-badge__popover', tooltipClassName ) }
				context={ divRef.current }
				isVisible={ isPopoverVisible }
				position={ tooltipPosition }
				focusOnShow={ focusOnShow }
			>
				{ tooltipContent }
			</Popover>
		</div>
	);
};

export default BundledBadge;
