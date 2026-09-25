/**
 * @jest-environment jsdom
 */

import { renderPluginsDashboard } from '../controller';

describe( 'renderPluginsDashboard', () => {
	test( 'passes the site and update filter from the route to the dashboard', () => {
		const context = {
			params: {
				site: 'example.com',
			},
			query: {
				updates: '1',
			},
		};
		const next = jest.fn();

		renderPluginsDashboard( context, next );

		expect( context.primary.props.siteSlug ).toBe( 'example.com' );
		expect( context.primary.props.showOnlyUpdates ).toBe( true );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );
} );
