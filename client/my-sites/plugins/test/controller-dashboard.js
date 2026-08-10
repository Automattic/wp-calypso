/**
 * @jest-environment jsdom
 */

import { renderPluginsDashboard } from '../controller';

describe( 'renderPluginsDashboard', () => {
	test( 'enables the update filter when the route asks for it', () => {
		const context = { params: {}, query: { updates: '1' } };
		const next = jest.fn();

		renderPluginsDashboard( context, next );

		expect( context.primary.props.showOnlyUpdates ).toBe( true );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'leaves the update filter off by default', () => {
		const context = { params: {}, query: {} };
		const next = jest.fn();

		renderPluginsDashboard( context, next );

		expect( context.primary.props.showOnlyUpdates ).toBe( false );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );
} );
