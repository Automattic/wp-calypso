import clsx from 'clsx';
import {
	Children,
	createRef,
	isValidElement,
	useMemo,
	useState,
	useRef,
	useLayoutEffect,
} from 'react';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import HoverIntent from 'calypso/lib/hover-intent';
import { hasTouch } from 'calypso/lib/touch-detect';
import ExpandableSidebarHeading from './expandable-heading';
import type { TranslateResult } from 'i18n-calypso';
import type { MouseEvent, ReactNode } from 'react';

const isTouch = hasTouch();

interface SidebarChildProps {
	selected?: boolean;
	children?: ReactNode;
}

interface ExpandableSidebarMenuProps {
	className?: string;
	title: TranslateResult;
	count?: number;
	countLabel?: string;
	compactCount?: boolean;
	onClick?: ( event?: MouseEvent< HTMLAnchorElement > ) => void;
	icon?: string | null;
	materialIcon?: string | null;
	materialIconStyle?: string | null;
	customIcon?: ReactNode;
	children?: ReactNode;
	disableFlyout?: boolean;
	expanded?: boolean | null;
	expandableIconClick?: () => void;
	prependContent?: ReactNode;
	appendContent?: ReactNode;
	moreMenuActions?: JSX.Element;
}

function containsSelectedSidebarItem( children: ReactNode ): boolean {
	let selectedItemFound = false;

	Children.forEach( children, ( child ) => {
		if ( selectedItemFound ) {
			return;
		}

		const props = isValidElement< SidebarChildProps >( child ) ? child.props : undefined;

		if ( props?.selected ) {
			selectedItemFound = true;
		} else if ( props?.children ) {
			selectedItemFound = containsSelectedSidebarItem( props.children );
		}
	} );

	return selectedItemFound;
}

const offScreen = ( submenu: HTMLElement ) => {
	const rect = submenu.getBoundingClientRect();
	return rect.y + rect.height > window.innerHeight;
};

export const ExpandableSidebarMenu = ( menuProps: ExpandableSidebarMenuProps ) => {
	const {
		className,
		title,
		count,
		countLabel,
		compactCount,
		onClick,
		icon,
		materialIcon,
		materialIconStyle,
		customIcon,
		children,
		disableFlyout,
		expanded: expandedProp,
		prependContent,
		appendContent,
		moreMenuActions,
		...props
	} = menuProps;
	// A `null` `expanded` prop means "auto-detect" from whether a child is selected.
	const expanded = null === expandedProp ? containsSelectedSidebarItem( children ) : expandedProp;
	const menu = createRef< HTMLUListElement >(); // Needed for HoverIntent.
	const submenu = useRef< HTMLLIElement >( null );
	const [ submenuHovered, setSubmenuHovered ] = useState( false );

	if ( submenu.current ) {
		// Sets flyout to expand towards bottom.
		submenu.current.style.bottom = 'auto';
		submenu.current.style.top = '0';
	}

	const classes = clsx( className, {
		'is-toggle-open': !! expanded,
		'is-togglable': true,
		hovered: submenuHovered,
	} );

	const onEnter = () => {
		if ( disableFlyout || expanded || isTouch ) {
			return;
		}

		setSubmenuHovered( true );
	};

	const onLeave = () => {
		// Remove "hovered" state even if menu is expanded.
		if ( isTouch ) {
			return;
		}

		setSubmenuHovered( false );
	};

	const menuId = useMemo( () => 'menu' + crypto.randomUUID(), [] );

	useLayoutEffect( () => {
		if ( submenuHovered && submenu.current && offScreen( submenu.current ) ) {
			// Sets flyout to expand towards top.
			submenu.current.style.bottom = '0';
			submenu.current.style.top = 'auto';
		}
	}, [ submenuHovered ] );

	return (
		<HoverIntent
			onMouseOver={ () => onEnter() }
			onMouseOut={ () => onLeave() }
			sensitivity={ 7 }
			interval={ 90 }
			timeout={ 200 }
		>
			<SidebarMenu ref={ menu } className={ classes }>
				<ExpandableSidebarHeading
					title={ title }
					count={ count }
					countLabel={ countLabel }
					compactCount={ compactCount }
					onClick={
						typeof onClick === 'function'
							? ( event ) => {
									setSubmenuHovered( false );
									onClick( event );
							  }
							: undefined
					}
					customIcon={ customIcon }
					icon={ icon }
					materialIcon={ materialIcon }
					materialIconStyle={ materialIconStyle }
					expanded={ expanded }
					menuId={ menuId }
					prependContent={ prependContent }
					appendContent={ appendContent }
					moreMenuActions={ moreMenuActions }
					{ ...props }
				/>
				<li
					role="region"
					ref={ submenu }
					id={ menuId }
					className="sidebar__expandable-content"
					hidden={ ! expanded }
				>
					<ul>{ children }</ul>
				</li>
			</SidebarMenu>
		</HoverIntent>
	);
};

export default ExpandableSidebarMenu;
