// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, expect, it, vi } from 'vitest';
import { processMarkdownExtensions } from '.';

// Importing the chart library takes seconds the first time, so the test doesn't wait on it.
beforeAll( () => import( './charts/chart-components' ), 30000 );

// Fails if the chart block's on-demand load stops resolving to the chart block. Data with no
// chart type gets the block's own message, so jsdom never draws a chart.
it( 'renders a chart code block once the charts load', async () => {
	const { code: Code } = processMarkdownExtensions( { charts: { enabled: true } } ).components;
	const container = document.createElement( 'div' );
	const root = createRoot( container );

	await act( async () => {
		root.render( Code ? <Code className="language-chart">{ '{ "data": [] }' }</Code> : null );
	} );

	await vi.waitFor( () =>
		expect( container.textContent ).toContain( 'Chart data must include chartType' )
	);
	act( () => root.unmount() );
} );
