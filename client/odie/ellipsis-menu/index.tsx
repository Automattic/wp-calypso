import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useRef, useState, FunctionComponent, PropsWithChildren } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import Button from '../button';

import './style.scss';

type EllipsisMenuProps = {
	position?: string;
	popoverClassName?: string;
} & PropsWithChildren;

const EllipsisMenu: FunctionComponent< EllipsisMenuProps > = ( {
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

	const classes = classnames( 'ellipsis-menu', {
		'is-menu-visible': isMenuVisible,
	} );
	const popoverClasses = classnames( 'ellipsis-menu__menu', 'popover', popoverClassName );

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

export default EllipsisMenu;
