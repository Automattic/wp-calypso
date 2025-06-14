import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ClickableItemProps, MenuItemProps } from '../types';

// Module-level state to track the currently open dropdown
let currentOpenDropdown: string | null = null;
const dropdownInstances = new Set< () => void >();

interface NonClickableItemProps extends MenuItemProps {
	children?: React.ReactNode;
}

export const NonClickableItem = ( { content, className, children }: NonClickableItemProps ) => {
	const [ isKeyboardOpen, setIsKeyboardOpen ] = useState( false );
	const dropdownRef = useRef< HTMLDivElement | null >( null );
	const buttonRef = useRef< HTMLButtonElement | null >( null );
	const contentString = String( content );

	const closeDropdown = useCallback( () => {
		setIsKeyboardOpen( false );
		if ( currentOpenDropdown === contentString ) {
			currentOpenDropdown = null;
		}
		// Remove focus from button when closing
		if ( buttonRef.current ) {
			buttonRef.current.blur();
		}
	}, [ contentString ] );

	useEffect( () => {
		// Register this dropdown instance
		dropdownInstances.add( closeDropdown );

		// Global click handler
		const handleGlobalClick = ( event: MouseEvent ) => {
			if (
				buttonRef.current &&
				! buttonRef.current.contains( event.target as Node ) &&
				dropdownRef.current &&
				! dropdownRef.current.contains( event.target as Node )
			) {
				closeDropdown();
			}
		};

		document.addEventListener( 'click', handleGlobalClick );

		return () => {
			// Cleanup
			dropdownInstances.delete( closeDropdown );
			document.removeEventListener( 'click', handleGlobalClick );
		};
	}, [ closeDropdown, contentString ] );

	const handleFocus = () => {
		// Close other dropdowns
		if ( currentOpenDropdown && currentOpenDropdown !== contentString ) {
			dropdownInstances.forEach( ( closeOther ) => {
				if ( closeOther !== closeDropdown ) {
					closeOther();
				}
			} );
		}

		currentOpenDropdown = contentString;
		setIsKeyboardOpen( true );
	};

	const handleBlur = () => {
		setIsKeyboardOpen( false );
		if ( currentOpenDropdown === contentString ) {
			currentOpenDropdown = null;
		}
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();

			if ( ! isKeyboardOpen ) {
				// Close other dropdowns before opening this one
				if ( currentOpenDropdown && currentOpenDropdown !== contentString ) {
					dropdownInstances.forEach( ( closeOther ) => {
						if ( closeOther !== closeDropdown ) {
							closeOther();
						}
					} );
				}
				currentOpenDropdown = contentString;
				setIsKeyboardOpen( true );
			} else {
				closeDropdown();
			}
		} else if ( event.key === 'Escape' && isKeyboardOpen ) {
			event.preventDefault();
			closeDropdown();
		}
	};

	const handleMouseEnter = () => {
		// Close any keyboard-opened dropdowns when hovering over a different menu item
		if ( currentOpenDropdown && currentOpenDropdown !== contentString ) {
			dropdownInstances.forEach( ( closeOther ) => {
				if ( closeOther !== closeDropdown ) {
					closeOther();
				}
			} );
		}
	};

	return (
		<>
			<button
				ref={ buttonRef }
				role="menuitem"
				className={ `x-nav-link x-link ${ className || '' }` }
				aria-haspopup="true"
				aria-expanded={ isKeyboardOpen }
				data-dropdown-trigger={ content }
				tabIndex={ 0 }
				onFocus={ handleFocus }
				onBlur={ handleBlur }
				onKeyDown={ handleKeyDown }
				onMouseEnter={ handleMouseEnter }
			>
				{ content } <span className="x-nav-link-chevron" aria-hidden="true"></span>
			</button>
			<div
				ref={ dropdownRef }
				className={ `x-dropdown-content ${ isKeyboardOpen ? 'is-keyboard-open' : '' }` }
				data-dropdown-name={ content }
				role="menu"
				aria-label={ `${ content } submenu` }
			>
				{ children }
			</div>
		</>
	);
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
