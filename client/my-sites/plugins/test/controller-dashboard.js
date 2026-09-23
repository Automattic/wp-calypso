/**
 * @jest-environment jsdom
 */
import { renderPluginsDashboard } from '../controller';

jest.mock( '../plugins-dashboard', () => 'PluginsDashboard' );

const renderWith = ( { params = {}, query = {} } = {} ) => {
	const context = { params, query };
	const next = jest.fn();

	renderPluginsDashboard( context, next );

	expect( next ).toHaveBeenCalledTimes( 1 );
	return context.primary.props;
};

describe( 'renderPluginsDashboard', () => {
	test( 'scopes the dashboard to the route site and pre-filters when ?updates=1', () => {
		expect( renderWith( { params: { site: 'example.com' }, query: { updates: '1' } } ) ).toEqual(
			expect.objectContaining( { siteSlug: 'example.com', filterUpdates: true } )
		);
	} );

	test( 'does not filter without the query param', () => {
		expect( renderWith( { params: { site: 'example.com' } } ) ).toEqual(
			expect.objectContaining( { siteSlug: 'example.com', filterUpdates: false } )
		);
	} );

	test( 'does not filter for any other value of the query param', () => {
		expect( renderWith( { query: { updates: 'yes' } } ) ).toEqual(
			expect.objectContaining( { filterUpdates: false } )
		);
	} );

	test( 'leaves the dashboard unscoped when the route has no site param', () => {
		expect( renderWith( { params: { slug: 'jetpack' } } ) ).toEqual(
			expect.objectContaining( { pluginSlug: 'jetpack', siteSlug: undefined } )
		);
	} );
} );
