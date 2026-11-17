import type { ChartTheme } from '@automattic/charts';

// Colors are the `--a8c-charts-color-*` roles in `style.scss`.
export const dashboardChartTheme: Partial< ChartTheme > = {
	gridStyles: {
		strokeWidth: 1,
	},
	xAxisLineStyles: {
		strokeWidth: 1,
	},
};
