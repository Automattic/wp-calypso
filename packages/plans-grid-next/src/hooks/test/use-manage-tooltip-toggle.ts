/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useManageTooltipToggle } from '../../components/shared/tooltip';
import { hasTouch } from '../../lib/touch-detect';

// Mocking the hasTouch function
jest.mock( '../../lib/touch-detect', () => ( {
	hasTouch: jest.fn(),
} ) );

describe( 'useManageTooltipToggle', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should close tooltips when touching outside the tooltip container', () => {
		hasTouch.mockReturnValue( true );

		const { result } = renderHook( () => useManageTooltipToggle() );
		const [ , setActiveTooltipId ] = result.current;

		act( () => setActiveTooltipId( 'tooltip-123' ) );

		expect( result.current[ 0 ] ).toBe( 'tooltip-123' );

		// Simulate touch outside the tooltip container
		act( () => {
			const touchEvent = new TouchEvent( 'touchstart' );
			const outsideElement = document.createElement( 'div' );

			document.body.appendChild( outsideElement );

			jest.spyOn( touchEvent, 'target', 'get' ).mockReturnValue( outsideElement );

			document.dispatchEvent( touchEvent );
		} );

		expect( result.current[ 0 ] ).toBe( '' );
	} );

	it( 'should not close tooltips when touching inside the tooltip container', () => {
		hasTouch.mockReturnValue( true );

		const { result } = renderHook( () => useManageTooltipToggle() );
		const [ , setActiveTooltipId ] = result.current;

		act( () => setActiveTooltipId( 'tooltip-123' ) );

		expect( result.current[ 0 ] ).toBe( 'tooltip-123' );

		// Simulate touch inside the tooltip container
		act( () => {
			const touchEvent = new TouchEvent( 'touchstart' );
			const tooltipContainer = document.createElement( 'div' );
			tooltipContainer.className = 'plans-grid-next-tooltip__hover-area-container';

			document.body.appendChild( tooltipContainer );

			jest.spyOn( touchEvent, 'target', 'get' ).mockReturnValue( tooltipContainer );

			document.dispatchEvent( touchEvent );
		} );

		expect( result.current[ 0 ] ).toBe( 'tooltip-123' );
	} );
} );
