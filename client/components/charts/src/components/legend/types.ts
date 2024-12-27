import { scaleOrdinal } from '@visx/scale';

export type LegendItem = {
	label: string;
	value: number | string;
	color: string;
};

export type LegendProps = {
	items: LegendItem[];
	className?: string;
	orientation?: 'horizontal' | 'vertical';
	scale?: ReturnType< typeof scaleOrdinal >;
};
