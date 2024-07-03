import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useRef, useState, FunctionComponent, PropsWithChildren } from 'react';
// eslint-disable-next-line no-restricted-imports
import PopoverMenu from 'calypso/components/popover-menu';
import Button from '../button';

import './style.scss';

type EllipsisMenuProps = {
	position?: string;
	popoverClassName?: string;
} & PropsWithChildren;

export const EllipsisMenu: FunctionComponent< EllipsisMenuProps > = ( {
	position,
	children,
	popoverClassName,
} ) => {
	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const popoverContext = useRef< HTMLButtonElement >( null );

	const handleClick = () => {
		setMenuVisible( ! isMenuVisible );
	};

	const hideMenu = () => {
		setMenuVisible( false );
	};

	const classes = clsx( 'ellipsis-menu', {
		'is-menu-visible': isMenuVisible,
	} );
	const popoverClasses = clsx( 'ellipsis-menu__menu', 'popover', popoverClassName );

	return (
		<span className={ classes }>
			<Button
				ref={ popoverContext }
				onClick={ handleClick }
				borderless
				className="ellipsis-menu__toggle"
			>
				<Gridicon icon="ellipsis" className="ellipsis-menu__toggle-icon" />
			</Button>
			{ isMenuVisible && (
				<PopoverMenu
					isVisible
					onClose={ hideMenu }
					position={ position }
					context={ popoverContext.current }
					className={ popoverClasses }
				>
					{ children }
				</PopoverMenu>
			) }
		</span>
	);
};
