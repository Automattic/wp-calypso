/**
 * External dependencies
 */
import { focus } from '@wordpress/dom';
import { createContext, useContext, useState, useRef, useLayoutEffect } from '@wordpress/element';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import './style.scss';

type NavigationState = {
	direction: string | null;
	focusSelector: string | null;
};

type SidebarNavigationContextType = {
	get: () => NavigationState;
	navigate: ( direction: string, focusSelector?: string | null ) => void;
};

type SidebarContentWrapperProps = {
	children: React.ReactNode;
	shouldAnimate: boolean;
};

/*
 * Default value for SidebarNavigationContext
 */
const defaultValue: SidebarNavigationContextType = {
	get: () => {
		throw new Error( 'SidebarNavigationContext is not provided' );
	},
	navigate: () => {
		throw new Error( 'SidebarNavigationContext is not provided' );
	},
};

export const SidebarNavigationContext =
	createContext< SidebarNavigationContextType >( defaultValue );

function focusSidebarElement(
	el: HTMLElement,
	direction: string | null,
	focusSelector: string | null
) {
	let elementToFocus: HTMLElement | null = null;
	if ( direction === 'back' && focusSelector ) {
		elementToFocus = el.querySelector( focusSelector );
	}
	if ( direction !== null && ! elementToFocus ) {
		const [ firstTabbable ] = focus.tabbable.find( el );
		elementToFocus = firstTabbable ?? el;
	}
	elementToFocus?.focus();
}

export function createNavState(): SidebarNavigationContextType {
	let state: NavigationState = {
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

function SidebarContentWrapper( { children, shouldAnimate }: SidebarContentWrapperProps ) {
	const navState = useContext( SidebarNavigationContext );

	if ( ! navState ) {
		throw new Error(
			'SidebarContentWrapper must be used within a SidebarNavigationContext.Provider'
		);
	}

	const wrapperRef = useRef< HTMLDivElement >( null );
	const [ navAnimation, setNavAnimation ] = useState< string | null >( null );

	useLayoutEffect( () => {
		const { direction, focusSelector } = navState.get();
		if ( wrapperRef.current ) {
			focusSidebarElement( wrapperRef.current, direction, focusSelector );
		}
		setNavAnimation( direction );
	}, [ navState ] );

	const wrapperCssClasses = clsx(
		'a8c-site-admin-sidebar__screen-wrapper',
		shouldAnimate
			? {
					'slide-from-left': navAnimation === 'back',
					'slide-from-right': navAnimation === 'forward',
			  }
			: {}
	);

	return (
		<div ref={ wrapperRef } className={ wrapperCssClasses }>
			{ children }
		</div>
	);
}

export interface SidebarContentProps {
	routeKey: string;
	shouldAnimate: boolean;
	children: React.ReactNode;
}

export function SidebarContent( { routeKey, shouldAnimate, children }: SidebarContentProps ) {
	const [ navState ] = useState( createNavState );

	return (
		<SidebarNavigationContext.Provider value={ navState }>
			<div className="a8c-site-admin-sidebar__content">
				<SidebarContentWrapper shouldAnimate={ shouldAnimate } key={ routeKey }>
					{ children }
				</SidebarContentWrapper>
			</div>
		</SidebarNavigationContext.Provider>
	);
}
