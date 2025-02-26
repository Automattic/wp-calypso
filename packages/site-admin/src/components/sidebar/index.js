/**
 * External dependencies
 */
import { focus } from '@wordpress/dom';
import { createContext, useContext, useState, useRef, useLayoutEffect } from '@wordpress/element';
import clsx from 'clsx';

export const SidebarNavigationContext = createContext( () => {} );
// Focus a sidebar element after a navigation. The element to focus is either
// specified by `focusSelector` (when navigating back) or it is the first
// tabbable element (usually the "Back" button).
function focusSidebarElement( el, direction, focusSelector ) {
	let elementToFocus;
	if ( direction === 'back' && focusSelector ) {
		elementToFocus = el.querySelector( focusSelector );
	}
	if ( direction !== null && ! elementToFocus ) {
		const [ firstTabbable ] = focus.tabbable.find( el );
		elementToFocus = firstTabbable ?? el;
	}
	elementToFocus?.focus();
}

// Navigation state that is updated when navigating back or forward. Helps us
// manage the animations and also focus.
function createNavState() {
	let state = {
		direction: null,
		focusSelector: null,
	};

	return {
		get() {
			return state;
		},
		navigate( direction, focusSelector = null ) {
			state = {
				direction,
				focusSelector:
					direction === 'forward' && focusSelector ? focusSelector : state.focusSelector,
			};
		},
	};
}

function SidebarContentWrapper( { children, shouldAnimate } ) {
	const navState = useContext( SidebarNavigationContext );
	const wrapperRef = useRef();
	const [ navAnimation, setNavAnimation ] = useState( null );

	useLayoutEffect( () => {
		const { direction, focusSelector } = navState.get();
		focusSidebarElement( wrapperRef.current, direction, focusSelector );
		setNavAnimation( direction );
	}, [ navState ] );

	const wrapperCls = clsx(
		'edit-site-sidebar__screen-wrapper',
		/*
		 * Some panes do not have sub-panes and therefore
		 * should not animate when clicked on.
		 */
		shouldAnimate
			? {
					'slide-from-left': navAnimation === 'back',
					'slide-from-right': navAnimation === 'forward',
			  }
			: {}
	);

	return (
		<div ref={ wrapperRef } className={ wrapperCls }>
			{ children }
		</div>
	);
}

export default function SidebarContent( { routeKey, shouldAnimate, children } ) {
	const [ navState ] = useState( createNavState );

	return (
		<SidebarNavigationContext.Provider value={ navState }>
			<div className="edit-site-sidebar__content">
				<SidebarContentWrapper shouldAnimate={ shouldAnimate } key={ routeKey }>
					{ children }
				</SidebarContentWrapper>
			</div>
		</SidebarNavigationContext.Provider>
	);
}
