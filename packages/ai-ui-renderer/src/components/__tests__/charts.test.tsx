import { render, screen, waitFor } from '@testing-library/react';
import { BASIC_CATALOG_ID, CHARTS_CATALOG_ID } from '../../capabilities';
import { CHARTS_CATALOG, createInteractiveUiCatalog } from '../../utils/catalog';
import { createInteractiveUiRuntime } from '../../utils/runtime';
import { InteractiveUiSurface } from '../interactive-ui-surface';
import type { InteractiveUiRuntime } from '../../utils/runtime';

let runtime: InteractiveUiRuntime;
let onError: jest.Mock;

beforeEach( () => {
	// Dates follow the page's language, so the tests don't depend on the machine's.
	document.documentElement.lang = 'en-US';
	onError = jest.fn();

	runtime = createInteractiveUiRuntime( {
		catalogs: [ createInteractiveUiCatalog(), createInteractiveUiCatalog( CHARTS_CATALOG ) ],
		onAction: jest.fn(),
		onError,
	} );
} );

afterEach( () => {
	runtime.dispose();
	document.documentElement.lang = '';
	jest.restoreAllMocks();
} );

// A Basic surface whose root is a chart titled "Stats", as the agent composes one.
function showChart( chart: { component: string } & Record< string, unknown > ) {
	runtime.processMessages(
		[
			{ version: 'v1.0', createSurface: { surfaceId: 'chart', catalogId: BASIC_CATALOG_ID } },
			{
				version: 'v1.0',
				updateComponents: {
					surfaceId: 'chart',
					components: [ { id: 'root', catalogId: CHARTS_CATALOG_ID, title: 'Stats', ...chart } ],
				},
			},
		],
		'message'
	);
}

it.each( [
	[
		'LineChart',
		{
			series: [
				{ label: 'Visits', data: [ { date: '2026-10-30', value: 12 } ] },
				{ label: 'Views', data: [ { date: '2026-10-30', value: 20 } ] },
			],
		},
		'Oct 30, 2026 12 20',
	],
	[
		'BarChart',
		{
			series: [
				{ label: 'Visits', data: [ { label: 'Home', value: 12 } ] },
				{ label: 'Views', data: [ { label: 'Home', value: 20 } ] },
			],
		},
		'Home 12 20',
	],
	[ 'PieChart', { data: [ { label: 'Search', value: 12 } ] }, 'Search 12' ],
] )(
	'renders a %s from the charts catalog on a Basic surface, with its data as a table',
	async ( component, props, row ) => {
		showChart( { component, ...props } );

		render( <InteractiveUiSurface surface={ runtime.getSurface( 'chart' )! } /> );

		expect( await screen.findByText( 'Stats', { selector: 'figcaption' } ) ).toBeVisible();
		expect( screen.getByRole( 'row', { name: row } ) ).toBeInTheDocument();
		expect( onError ).not.toHaveBeenCalled();
	}
);

it( 'rejects a chart item with a key its schema doesn’t declare', () => {
	showChart( {
		component: 'BarChart',
		series: [ { label: 'Sales', data: [ { label: 'Jan', value: 1, date: '2026-01-01' } ] } ],
	} );

	expect( onError ).toHaveBeenCalledTimes( 1 );
} );

it( 'formats dates in the page’s language', async () => {
	document.documentElement.lang = 'de-DE';

	showChart( {
		component: 'LineChart',
		series: [ { label: 'Visits', data: [ { date: '2026-10-30', value: 12 } ] } ],
	} );

	render( <InteractiveUiSurface surface={ runtime.getSurface( 'chart' )! } /> );

	expect( await screen.findByRole( 'row', { name: '30.10.2026 12' } ) ).toBeInTheDocument();
} );

it( 'lists a line chart’s data in date order', async () => {
	showChart( {
		component: 'LineChart',
		series: [
			{
				label: 'Visits',
				data: [
					{ date: '2026-10-30', value: 12 },
					{ date: '2026-10-29', value: 8 },
				],
			},
		],
	} );

	render( <InteractiveUiSurface surface={ runtime.getSurface( 'chart' )! } /> );

	const rows = await screen.findAllByRole( 'row' );

	expect( rows.map( ( row ) => row.textContent ) ).toEqual( [
		'DateVisits',
		'Oct 29, 20268',
		'Oct 30, 202612',
	] );
} );

it.each( [
	[
		'an impossible date',
		{
			component: 'LineChart',
			series: [ { label: 'Visits', data: [ { date: '2026-02-30', value: 12 } ] } ],
		},
	],
	[
		'two series with one name',
		{
			component: 'BarChart',
			series: [
				{ label: 'Sales', data: [ { label: 'Jan', value: 1 } ] },
				{ label: 'Sales', data: [ { label: 'Jan', value: 2 } ] },
			],
		},
	],
	[
		'one category twice',
		{
			component: 'BarChart',
			series: [
				{
					label: 'Sales',
					data: [
						{ label: 'Jan', value: 1 },
						{ label: 'Jan', value: 2 },
					],
				},
			],
		},
	],
	[ 'a pie of zeros', { component: 'PieChart', data: [ { label: 'Search', value: 0 } ] } ],
] )( 'reports a chart with %s instead of drawing it', async ( _case, chart ) => {
	jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	showChart( chart );

	render( <InteractiveUiSurface surface={ runtime.getSurface( 'chart' )! } /> );

	await waitFor( () =>
		expect( onError ).toHaveBeenCalledWith(
			expect.objectContaining( { code: 'RENDER_FAILED' } ),
			'message'
		)
	);
} );
