/** @format */
/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';

/**
 * Internal dependencies
 */
import {
	isWithinBreakpoint,
	addWithinBreakpointListener,
	removeWithinBreakpointListener,
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
	const [ isActive, setIsActive ] = useState( isWithinBreakpoint( breakpoint ) );

	function handleBreakpointChange( currentStatus ) {
		setIsActive( currentStatus );
	}

	useEffect(() => {
		addWithinBreakpointListener( breakpoint, handleBreakpointChange );

		return function cleanup() {
			removeWithinBreakpointListener( breakpoint, handleBreakpointChange );
		};
	}, []);

	return isActive;
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
 * React higher order component for getting the status for a breakpoint and
 * keeping it updated.
 *
 * @param {React.Component|Function} Wrapped The component to wrap.
 * @param {String} breakpoint The breakpoint to consider.
 *
 * @returns {React.Component} The wrapped component.
 */
export function withBreakpoint( Wrapped, breakpoint ) {
	return class extends React.Component {
		state = { isActive: isWithinBreakpoint( breakpoint ) };

		handleBreakpointChange = currentStatus => {
			this.setState( { isActive: currentStatus } );
		};

		componentDidMount() {
			addWithinBreakpointListener( breakpoint, this.handleBreakpointChange );
		}

		componentWillUnmount() {
			removeWithinBreakpointListener( breakpoint, this.handleBreakpointChange );
		}

		render() {
			return <Wrapped isBreakpointActive={ this.state.isActive } { ...this.props } />;
		}
	};
}

/**
 * React higher order component for getting the status for the mobile
 * breakpoint and keeping it updated.
 *
 * @param {React.Component|Function} Wrapped The component to wrap.
 *
 * @returns {React.Component} The wrapped component.
 */
export function withMobileBreakpoint( Wrapped ) {
	return withBreakpoint( Wrapped, MOBILE_BREAKPOINT );
}

/**
 * React higher order component for getting the status for the desktop
 * breakpoint and keeping it updated.
 *
 * @param {React.Component|Function} Wrapped The component to wrap.
 *
 * @returns {React.Component} The wrapped component.
 */
export function withDesktopBreakpoint( Wrapped ) {
	return withBreakpoint( Wrapped, DESKTOP_BREAKPOINT );
}
