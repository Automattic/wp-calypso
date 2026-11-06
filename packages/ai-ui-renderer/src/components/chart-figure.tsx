import * as Charts from '@automattic/charts';
import { VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import type { ChartTable } from '../utils/chart-data';
import type { KeyboardEvent, ReactNode } from 'react';
import '@automattic/charts/style.css';

export const CHART_HEIGHT = 240;

// Bars and lines start from zero, so they don't exaggerate differences.
export const ZERO_BASED_SCALE = { zero: true };

// The library resolves color tokens against the page, not the surface, so the labels and legend use
// the surface's text color, and the series plain colors with at least 3:1 contrast on white and
// #1e1e1e.
const CHART_THEME: Partial< Charts.ChartTheme > = {
	// The library outlines hovered points with this color, resolved against the page.
	backgroundColor: 'transparent',
	colors: [ '#4f6bed', '#d65d00', '#008a8a', '#8c5fd9', '#d94f8a', '#008a20' ],
	svgLabelSmall: { fill: 'currentColor', fontSize: 12, fontWeight: 400 },
	legend: { labelStyles: { color: 'inherit' } },
};

// The library focuses its tooltip, in a portal at the end of the page, but never refocuses the
// chart, so focus returns to the chart on Tab and when the tooltip closes.
function returnFocusToChart( event: KeyboardEvent< HTMLElement > ) {
	const figure = event.currentTarget;
	const chart = figure.querySelector< HTMLElement >( '[role="grid"]' );

	if ( event.key === 'Tab' && ! figure.contains( document.activeElement ) ) {
		chart?.focus();
		return;
	}

	requestAnimationFrame( () => {
		if ( document.activeElement === document.body ) {
			chart?.focus();
		}
	} );
}

interface ChartFigureProps {
	className?: string;
	title: string;
	table: ChartTable;
	children: ReactNode;
}

// The library's SVG doesn't expose the data, so screen readers get it as a table instead.
export function ChartFigure( { className, title, table, children }: ChartFigureProps ) {
	return (
		// Key events from the tooltip's portal bubble here.
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<figure
			className={ clsx( 'ai-ui-renderer__chart', className ) }
			onKeyDown={ returnFocusToChart }
		>
			<figcaption className="ai-ui-renderer__chart-title">{ title }</figcaption>

			<Charts.GlobalChartsProvider theme={ CHART_THEME }>{ children }</Charts.GlobalChartsProvider>

			<VisuallyHidden>
				<table>
					<thead>
						<tr>
							{ table.headings.map( ( heading, index ) => (
								<th key={ index } scope="col">
									{ heading }
								</th>
							) ) }
						</tr>
					</thead>
					<tbody>
						{ table.rows.map( ( [ key, ...values ] ) => (
							<tr key={ key }>
								<th scope="row">{ key }</th>
								{ values.map( ( value, index ) => (
									<td key={ index }>{ value }</td>
								) ) }
							</tr>
						) ) }
					</tbody>
				</table>
			</VisuallyHidden>
		</figure>
	);
}
