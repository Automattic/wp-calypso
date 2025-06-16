import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import React, { useState, useRef, useEffect } from 'react';
import { ClickableItemProps, MenuItemProps } from '../types';

/* eslint-disable no-console */
const debug = ( ...args: unknown[] ) => {
	if ( typeof window !== 'undefined' && window.localStorage.getItem( 'debug' ) ) {
		console.log( '[NonClickableItem]', ...args );
	}
};
/* eslint-enable no-console */

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
	const containerRef = useRef< HTMLDivElement >( null );
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );

	const handleMouseEnter = () => {
		debug( 'Mouse enter - opening dropdown' );
		if ( timeoutRef.current ) {
			clearTimeout( timeoutRef.current );
			timeoutRef.current = null;
		}
		setIsHoverOpen( true );
	};

	const handleMouseLeave = () => {
		debug( 'Mouse leave - closing dropdown with delay' );
		// Add a small delay to prevent flickering when moving between trigger and dropdown
		timeoutRef.current = setTimeout( () => {
			setIsHoverOpen( false );
		}, 150 );
	};

	// Clean up timeout on unmount
	useEffect( () => {
		return () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}
		};
	}, [] );

	return (
		<div ref={ containerRef } onMouseEnter={ handleMouseEnter } onMouseLeave={ handleMouseLeave }>
			<DropdownMenu
				label={ `${ contentString } submenu` }
				icon={ chevronDown }
				className={ `x-nav-link x-link ${ className || '' }` }
				open={ isHoverOpen }
				popoverProps={ {
					className: 'x-nav-dropdown-popover',
					position: 'bottom',
					noArrow: true,
					offset: 10,
					animate: true,
					expandOnMobile: true,
					onClose: () => {
						debug( 'Popover closing' );
						setIsHoverOpen( false );
					},
				} }
				toggleProps={ {
					className: 'x-nav-link x-link',
					// @ts-ignore - data attributes are valid HTML props
					'data-dropdown-trigger': content,
					onKeyDown: ( event: React.KeyboardEvent ) => {
						if ( event.key === 'Enter' || event.key === ' ' ) {
							event.preventDefault();
							debug( 'Keyboard toggle - opening dropdown' );
							setIsHoverOpen( ! isHoverOpen );
						} else if ( event.key === 'Escape' && isHoverOpen ) {
							event.preventDefault();
							debug( 'Escape pressed - closing dropdown' );
							setIsHoverOpen( false );
						}
					},
					children: (
						<>
							{ contentString }
							<span className="x-nav-link__chevron" />
						</>
					),
				} }
			>
				{ ( { onClose }: { onClose: () => void } ) => {
					debug( 'Dropdown render function called' );
					return (
						<>
							{ React.Children.map( children, ( child ) => {
								debug( 'Processing child:', child );
								if ( React.isValidElement( child ) ) {
									if ( child.type === 'ul' ) {
										return (
											<MenuGroup>
												{ React.Children.map( child.props.children, ( menuItem ) => {
													debug( 'Processing menu item:', menuItem );
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
																	debug( 'MenuItem clicked' );
																	// Create a temporary link element for tracking
																	const tempLink = document.createElement( 'a' );
																	tempLink.href = urlValue;
																	tempLink.className = 'x-dropdown-link';
																	tempLink.innerText = String( itemContent );
																	clickNavLinkEvent( tempLink );

																	// Handle navigation
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
										debug( 'Rendering separator' );
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
