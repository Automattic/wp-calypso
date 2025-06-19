import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import React, { useState, useRef, useEffect } from 'react';
import { ClickableItemProps, MenuItemProps } from '../types';

let currentOpenDropdown: string | null = null;
const dropdownCloseCallbacks = new Map< string, () => void >();
let focusTargetOnClose: HTMLElement | null = null;
let isKeyboardInteraction = false;

const registerDropdown = ( id: string, closeCallback: () => void ) => {
	dropdownCloseCallbacks.set( id, closeCallback );
};

const unregisterDropdown = ( id: string ) => {
	dropdownCloseCallbacks.delete( id );
};

const openDropdown = ( id: string, triggerElement?: HTMLElement, viaKeyboard = false ) => {
	if ( currentOpenDropdown && currentOpenDropdown !== id ) {
		const closeCallback = dropdownCloseCallbacks.get( currentOpenDropdown );
		if ( closeCallback ) {
			closeCallback();
		}
	}
	currentOpenDropdown = id;
	isKeyboardInteraction = viaKeyboard;
	if ( triggerElement ) {
		focusTargetOnClose = triggerElement;
	}
};

const closeDropdown = ( id: string ) => {
	if ( currentOpenDropdown === id ) {
		currentOpenDropdown = null;
		if ( focusTargetOnClose && isKeyboardInteraction ) {
			focusTargetOnClose.focus();
		} else if ( ! isKeyboardInteraction ) {
			if ( document.activeElement && document.activeElement instanceof HTMLElement ) {
				document.activeElement.blur();
			}
		}
		focusTargetOnClose = null;
		isKeyboardInteraction = false;
	}
};

const getParentElement = ( node: HTMLElement | null, pattern: RegExp ) => {
	let parent = node;
	while ( parent && ! parent.className.match( pattern ) ) {
		if ( parent === document.body ) {
			return null;
		}
		parent = parent.parentElement;
	}

	return parent;
};

const clickNavLinkEvent = ( target: HTMLElement ) => {
	const props: { [ key: string ]: string | number } = {};

	const container = getParentElement( target, /container/ );
	const section = getParentElement( target, /section/ );

	props.container_id = container?.id || '';
	props.container_class = container?.className || '';
	props.container = props.container_id || props.container_class || '';

	props.section_id = section?.id || '';
	props.section_class = section?.className || '';
	props.section = props.section_id || props.section_class || '';

	props.id = target.id || '';
	props.class = target.className || '';

	props.href = target.getAttribute( 'href' ) || '';
	props.target = target.getAttribute( 'target' ) || '';
	props.text = target.innerText || '';

	if ( typeof window !== 'undefined' && window.location ) {
		const currentPage = window.location.pathname || '';
		props.lp_name = currentPage.replace( /^\//, '' );
		props.path = props.lp_name;
	}

	recordTracksEvent( 'calypso_link_click', props );
};

export const ClickableItem = ( {
	titleValue,
	content,
	urlValue,
	className,
	type,
	typeClassName,
	target,
}: ClickableItemProps ) => {
	let liClassName = '';
	if ( type === 'menu' ) {
		liClassName = liClassName + ' x-menu-grid-item';
	}
	if ( className ) {
		liClassName = liClassName + ' ' + className;
	}

	const onClick = ( event: React.MouseEvent< HTMLElement > ) => {
		const target = event.currentTarget;
		clickNavLinkEvent( target );
	};

	return (
		<li className={ liClassName } role="none">
			<a
				role="menuitem"
				className={ typeClassName ? typeClassName : `x-${ type }-link x-link` }
				href={ urlValue }
				title={ titleValue }
				tabIndex={ type === 'nav' ? 0 : -1 }
				target={ target }
				onClick={ onClick }
			>
				{ content }
			</a>
		</li>
	);
};

interface NonClickableItemProps extends MenuItemProps {
	children?: React.ReactNode;
}

export const NonClickableItem = ( { content, className, children }: NonClickableItemProps ) => {
	const contentString = String( content );
	const [ isHoverOpen, setIsHoverOpen ] = useState( false );
	const [ wasOpenedViaKeyboard, setWasOpenedViaKeyboard ] = useState( false );
	const containerRef = useRef< HTMLDivElement >( null );
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const triggerButtonRef = useRef< HTMLButtonElement | null >( null );

	const dropdownId = useRef(
		`dropdown-${ contentString.toLowerCase().replace( /\s+/g, '-' ) }-${ Math.random()
			.toString( 36 )
			.substr( 2, 9 ) }`
	);

	const handleClose = () => {
		setIsHoverOpen( false );
		setWasOpenedViaKeyboard( false );
		closeDropdown( dropdownId.current );
	};

	const handleOpen = ( viaKeyboard = false ) => {
		openDropdown( dropdownId.current, triggerButtonRef.current || undefined, viaKeyboard );
		setIsHoverOpen( true );
		setWasOpenedViaKeyboard( viaKeyboard );
	};

	useEffect( () => {
		const id = dropdownId.current;
		registerDropdown( id, handleClose );
		return () => {
			unregisterDropdown( id );
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}
		};
	}, [] );

	useEffect( () => {
		const handleEscapeKey = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' && isHoverOpen ) {
				event.preventDefault();
				handleClose();
			}
		};

		if ( isHoverOpen ) {
			document.addEventListener( 'keydown', handleEscapeKey );
		}

		return () => {
			document.removeEventListener( 'keydown', handleEscapeKey );
		};
	}, [ isHoverOpen ] );

	const handleMouseEnter = () => {
		if ( timeoutRef.current ) {
			clearTimeout( timeoutRef.current );
			timeoutRef.current = null;
		}
		handleOpen( false );
	};

	const handleMouseLeave = () => {
		timeoutRef.current = setTimeout( () => {
			handleClose();
		}, 150 );
	};

	return (
		<div ref={ containerRef } onMouseEnter={ handleMouseEnter } onMouseLeave={ handleMouseLeave }>
			<DropdownMenu
				label={ `${ contentString } submenu` }
				icon={ chevronDown }
				className={ `x-nav-link x-link ${ className || '' }` }
				open={ isHoverOpen }
				disableOpenOnArrowDown
				popoverProps={ {
					className: 'x-nav-dropdown-popover',
					position: 'bottom',
					noArrow: true,
					offset: 10,
					animate: true,
					expandOnMobile: true,
					focusOnMount: wasOpenedViaKeyboard ? true : false,
					onClose: () => {
						handleClose();
					},
				} }
				toggleProps={ {
					className: 'x-nav-link x-link',
					// @ts-ignore - data attributes are valid HTML props
					'data-dropdown-trigger': content,
					onFocus: () => {
						// Open dropdown when tabbing to the trigger
						if ( ! isHoverOpen ) {
							handleOpen( true );
						}
					},
					onKeyDown: ( event: React.KeyboardEvent ) => {
						// Only handle Escape to close - remove Enter/Space opening
						if ( event.key === 'Escape' && isHoverOpen ) {
							event.preventDefault();
							handleClose();
						}
					},
					children: (
						<span
							ref={ ( el ) => {
								if ( el ) {
									const button = el.closest( 'button' );
									if ( button ) {
										triggerButtonRef.current = button as HTMLButtonElement;
									}
								}
							} }
						>
							{ contentString }
							<span className="x-nav-link__chevron" />
						</span>
					),
				} }
			>
				{ ( { onClose }: { onClose: () => void } ) => {
					return (
						<>
							{ React.Children.map( children, ( child ) => {
								if ( React.isValidElement( child ) ) {
									if ( child.type === 'ul' ) {
										return (
											<MenuGroup>
												{ React.Children.map( child.props.children, ( menuItem ) => {
													if (
														React.isValidElement( menuItem ) &&
														menuItem.type === ClickableItem
													) {
														const {
															urlValue,
															content: itemContent,
															target,
														} = menuItem.props as ClickableItemProps;
														return (
															<MenuItem
																key={ urlValue }
																onClick={ () => {
																	const tempLink = document.createElement( 'a' );
																	tempLink.href = urlValue;
																	tempLink.className = 'x-dropdown-link';
																	tempLink.innerText = String( itemContent );
																	clickNavLinkEvent( tempLink );

																	window.open( urlValue, target || '_self' );
																	onClose();
																} }
															>
																{ itemContent }
															</MenuItem>
														);
													}
													return null;
												} ) }
											</MenuGroup>
										);
									} else if (
										child.type === 'div' &&
										child.props.className === 'x-dropdown-content-separator'
									) {
										return <hr className="x-dropdown-content-separator" />;
									}
								}
								return null;
							} ) }
						</>
					);
				} }
			</DropdownMenu>
		</div>
	);
};
