import * as Charts from '@automattic/charts';
import { VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import type { ChartTable } from '../utils/chart-data';
import type { ReactNode } from 'react';
import '@automattic/charts/style.css';

export const CHART_HEIGHT = 240;

// Bars and lines start from zero, so they don't exaggerate differences.
export const ZERO_BASED_SCALE = { zero: true };

// Plain colors with at least 3:1 contrast on white and #1e1e1e. Charts take them per series, as the
// library's palette has only five slots and fills further ones with colors of its own.
const CHART_COLORS = [ '#4f6bed', '#d65d00', '#008a8a', '#8c5fd9', '#d94f8a', '#008a20' ];

export function getChartColor( index: number ) {
	return CHART_COLORS[ index % CHART_COLORS.length ];
}

// The other colors are `--a8c-charts-color-*` roles in `style.scss`.
const CHART_THEME: Partial< Charts.ChartTheme > = {
	svgLabelSmall: { fontSize: 12, fontWeight: 400 },
};

interface ChartFigureProps {
	className?: string;
	title: string;
	table: ChartTable;
	children: ReactNode;
}

// The library's SVG doesn't expose the data, so screen readers get it as a table instead.
export function ChartFigure( { className, title, table, children }: ChartFigureProps ) {
	return (
		<figure className={ clsx( 'ai-ui-renderer__chart', className ) }>
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
