/** @format */
/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { camelCase, upperFirst } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isWithinBreakpoint,
	subscribeIsWithinBreakpoint,
	MOBILE_BREAKPOINT,
	DESKTOP_BREAKPOINT,
} from './index';

/**
 * React hook for getting the status for a breakpoint and keeping it updated.
 *
 * @param {String} breakpoint The breakpoint to consider.
 *
 * @returns {Boolean} The current status for the breakpoint.
 */
export function useBreakpoint( breakpoint ) {
	const [ state, setState ] = useState( () => ( {
		isActive: isWithinBreakpoint( breakpoint ),
		breakpoint,
	} ) );

	useEffect(() => {
		function handleBreakpointChange( currentStatus ) {
			setState( prevState => {
				// Ensure we bail out without rendering if nothing changes, by preserving state.
				if ( prevState.isActive === currentStatus && prevState.breakpoint === breakpoint ) {
					return prevState;
				}
				return { isActive: currentStatus, breakpoint };
			} );
		}

		const unsubscribe = subscribeIsWithinBreakpoint( breakpoint, handleBreakpointChange );
		// The unsubscribe function is the entire cleanup for the effect.
		return unsubscribe;
	}, [ breakpoint ]);

	return breakpoint === state.breakpoint ? state.isActive : isWithinBreakpoint( breakpoint );
}

/**
 * React hook for getting the status for the mobile breakpoint and keeping it
 * updated.
 *
 * @returns {Boolean} The current status for the breakpoint.
 */
export function useMobileBreakpoint() {
	return useBreakpoint( MOBILE_BREAKPOINT );
}

/**
 * React hook for getting the status for the desktop breakpoint and keeping it
 * updated.
 *
 * @returns {Boolean} The current status for the breakpoint.
 */
export function useDesktopBreakpoint() {
	return useBreakpoint( DESKTOP_BREAKPOINT );
}

/**
 * Auxiliary method to produce a higher order component for getting the status
 * for a breakpoint and keeping it updated. It also sets the component name.
 * @param {React.Component|Function} Wrapped The component to wrap.
 * @param {String} breakpoint The breakpoint to consider.
 * @param {String} modifierName The name to modify the component with.
 *
 * @returns {Function} The wrapped component.
 */
function withBreakpointAux( Wrapped, breakpoint, modifierName ) {
	const EnhancedComponent = function( props ) {
		const isActive = useBreakpoint( breakpoint );
		return <Wrapped isBreakpointActive={ isActive } { ...props } />;
	};

	const displayName = Wrapped.displayName || Wrapped.name || 'Component';
	EnhancedComponent.displayName = `${ upperFirst( camelCase( modifierName ) ) }(${ displayName })`;

	return EnhancedComponent;
}

/**
 * React higher order component for getting the status for a breakpoint and
 * keeping it updated.
 *
 * @param {String} breakpoint The breakpoint to consider.
 *
 * @returns {Function} A function that given a component returns the
 * wrapped component.
 */
export function withBreakpoint( breakpoint ) {
	return Wrapped => withBreakpointAux( Wrapped, breakpoint, 'WithBreakpoint' );
}

/**
 * React higher order component for getting the status for the mobile
 * breakpoint and keeping it updated.
 *
 * @param {React.Component|Function} Wrapped The component to wrap.
 *
 * @returns {Function} The wrapped component.
 */
export function withMobileBreakpoint( Wrapped ) {
	return withBreakpointAux( Wrapped, MOBILE_BREAKPOINT, 'WithMobileBreakpoint' );
}

/**
 * React higher order component for getting the status for the desktop
 * breakpoint and keeping it updated.
 *
 * @param {React.Component|Function} Wrapped The component to wrap.
 *
 * @returns {Function} The wrapped component.
 */
export function withDesktopBreakpoint( Wrapped ) {
	return withBreakpointAux( Wrapped, DESKTOP_BREAKPOINT, 'WithDesktopBreakpoint' );
}
