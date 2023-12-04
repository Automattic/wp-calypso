import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, MouseEvent, FunctionComponent, PropsWithChildren } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import Button from '../button';
import { noop } from '../context';

import './style.scss';

type EllipsisMenuProps = {
	toggleTitle?: string;
	position?: string;
	disabled?: boolean;
	onClick?: ( event: MouseEvent ) => void;
	onToggle?: ( isMenuVisible: boolean ) => void;
	popoverClassName?: string;
	icon?: React.ReactElement;
	className?: string;
} & PropsWithChildren;

const EllipsisMenu: FunctionComponent< EllipsisMenuProps > = ( {
	toggleTitle,
	position,
	children,
	disabled = false,
	onClick = noop,
	onToggle = noop,
	popoverClassName,
	icon,
	className,
} ) => {
	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const popoverContext = useRef< HTMLButtonElement >( null );
	const translate = useTranslate();

	const handleClick = ( event: MouseEvent ) => {
		onClick( event );
		setMenuVisible( ! isMenuVisible );
		if ( ! isMenuVisible ) {
			onToggle( true );
		} else {
			onToggle( false );
		}
	};

	const hideMenu = () => {
		setMenuVisible( false );
		onToggle( false );
	};

	const classes = classnames( 'ellipsis-menu', className, {
		'is-menu-visible': isMenuVisible,
		'is-disabled': disabled,
	} );
	const popoverClasses = classnames( 'ellipsis-menu__menu', 'popover', popoverClassName );

	return (
		<span className={ classes }>
			<Button
				ref={ popoverContext }
				onClick={ handleClick }
				title={ toggleTitle || translate( 'Toggle menu' ) }
				borderless
				disabled={ disabled }
				className="ellipsis-menu__toggle"
			>
				{ icon || <Gridicon icon="ellipsis" className="ellipsis-menu__toggle-icon" /> }
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
