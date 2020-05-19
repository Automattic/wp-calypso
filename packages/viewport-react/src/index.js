/**
 * External dependencies
 */
import React, { forwardRef, useState, useEffect } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import {
	isWithinBreakpoint,
	subscribeIsWithinBreakpoint,
	MOBILE_BREAKPOINT,
	DESKTOP_BREAKPOINT,
} from '@automattic/viewport';

/**
 * React hook for getting the status for a breakpoint and keeping it updated.
 *
 * @param {string} breakpoint The breakpoint to consider.
 *
 * @returns {boolean} The current status for the breakpoint.
 */
export function useBreakpoint( breakpoint ) {
	const [ state, setState ] = useState( () => ( {
		isActive: isWithinBreakpoint( breakpoint ),
		breakpoint,
	} ) );

	useEffect( () => {
		function handleBreakpointChange( isActive ) {
			setState( ( prevState ) => {
				// Ensure we bail out without rendering if nothing changes, by preserving state.
				if ( prevState.isActive === isActive && prevState.breakpoint === breakpoint ) {
					return prevState;
				}
				return { isActive, breakpoint };
			} );
		}

		const unsubscribe = subscribeIsWithinBreakpoint( breakpoint, handleBreakpointChange );
		// The unsubscribe function is the entire cleanup for the effect.
		return unsubscribe;
	}, [ breakpoint ] );

	return breakpoint === state.breakpoint ? state.isActive : isWithinBreakpoint( breakpoint );
}

/**
 * React hook for getting the status for the mobile breakpoint and keeping it
 * updated.
 *
 * @returns {boolean} The current status for the breakpoint.
 */
export function useMobileBreakpoint() {
	return useBreakpoint( MOBILE_BREAKPOINT );
}

/**
 * React hook for getting the status for the desktop breakpoint and keeping it
 * updated.
 *
 * @returns {boolean} The current status for the breakpoint.
 */
export function useDesktopBreakpoint() {
	return useBreakpoint( DESKTOP_BREAKPOINT );
}

/**
 * React higher order component for getting the status for a breakpoint and
 * keeping it updated.
 *
 * @param {string} breakpoint The breakpoint to consider.
 *
 * @returns {Function} A function that given a component returns the
 * wrapped component.
 */
export const withBreakpoint = ( breakpoint ) =>
	createHigherOrderComponent(
		( WrappedComponent ) =>
			forwardRef( ( props, ref ) => {
				const isActive = useBreakpoint( breakpoint );
				return <WrappedComponent { ...props } isBreakpointActive={ isActive } ref={ ref } />;
			} ),
		'WithBreakpoint'
	);

/**
 * React higher order component for getting the status for the mobile
 * breakpoint and keeping it updated.
 *
 * @param {React.Component|Function} Wrapped The component to wrap.
 *
 * @returns {Function} The wrapped component.
 */
export const withMobileBreakpoint = createHigherOrderComponent(
	( WrappedComponent ) =>
		forwardRef( ( props, ref ) => {
			const isActive = useBreakpoint( MOBILE_BREAKPOINT );
			return <WrappedComponent { ...props } isBreakpointActive={ isActive } ref={ ref } />;
		} ),
	'WithMobileBreakpoint'
);

/**
 * React higher order component for getting the status for the desktop
 * breakpoint and keeping it updated.
 *
 * @param {React.Component|Function} Wrapped The component to wrap.
 *
 * @returns {Function} The wrapped component.
 */
export const withDesktopBreakpoint = createHigherOrderComponent(
	( WrappedComponent ) =>
		forwardRef( ( props, ref ) => {
			const isActive = useBreakpoint( DESKTOP_BREAKPOINT );
			return <WrappedComponent { ...props } isBreakpointActive={ isActive } ref={ ref } />;
		} ),
	'WithDesktopBreakpoint'
);
