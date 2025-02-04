/**
 * External dependencies
 */
import { focus } from '@wordpress/dom';
import { createContext, useContext, useState, useRef, useLayoutEffect } from '@wordpress/element';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { unstableResourceWarning } from '../../../../../debug';
import './style.scss'; // @Todo: different from core: not imported in this way

type NavigationState = {
	direction: string | null;
	focusSelector: string | null;
};

type SidebarNavigationContextType = {
	get: () => NavigationState;
	navigate: ( direction: string, focusSelector?: string | null ) => void;
};

/*
 * Default value for SidebarNavigationContext
 * @unstable: TS fix -> SidebarNavigationContextType should be defined.
 * Not implemented in core.
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
	let elementToFocus: HTMLElement | null = null; // @unstable: TS fix -> HTMLElement should be defined
	if ( direction === 'back' && focusSelector ) {
		elementToFocus = el.querySelector( focusSelector );
	}
	if ( direction !== null && ! elementToFocus ) {
		const [ firstTabbable ] = focus.tabbable.find( el );
		elementToFocus = firstTabbable ?? el;
	}
	elementToFocus?.focus();
}

function createNavState(): SidebarNavigationContextType {
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

function SidebarContentWrapper( {
	children,
	shouldAnimate,
}: {
	children: React.ReactNode;
	shouldAnimate: boolean;
} ) {
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

	const wrapperCls = clsx(
		'edit-site-sidebar__screen-wrapper',
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

export default function SidebarContent( {
	routeKey,
	shouldAnimate,
	children,
}: {
	routeKey: string;
	shouldAnimate: boolean;
	children: React.ReactNode;
} ) {
	unstableResourceWarning(
		'<SidebarContent />',
		'https://github.com/WordPress/gutenberg/blob/a89831f1da023d2e2735a50c75a1ca837efa91ea/packages/edit-site/src/components/sidebar/index.js#L90'
	);
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
