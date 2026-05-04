import type { ChartTheme } from '@automattic/charts';

export const dashboardChartTheme: Partial< ChartTheme > = {
	backgroundColor: 'var(--dashboard-surface__background-color)',
	gridColor: 'var(--dashboard-surface__border-color)',
	gridColorDark: 'var(--dashboard-surface__border-color)',
	gridStyles: {
		stroke: 'var(--dashboard-surface__border-color)',
		strokeWidth: 1,
	},
	xAxisLineStyles: {
		stroke: 'var(--dashboard-surface__border-color)',
		strokeWidth: 1,
	},
	xTickLineStyles: {
		stroke: 'var(--dashboard-surface__border-color)',
	},
	legendLabelStyles: {
		color: 'var(--dashboard__text-muted-color)',
	},
	svgLabelSmall: {
		fill: 'var(--dashboard__text-muted-color)',
	},
};
