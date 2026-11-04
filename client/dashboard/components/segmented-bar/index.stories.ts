import { formatCurrency } from '@automattic/number-formatters';
import SegmentedBar, { SegmentedBarSegment } from './';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof SegmentedBar > = {
	title: 'client/dashboard/SegmentedBar',
	component: SegmentedBar,
	tags: [ 'autodocs' ],
};

export default meta;
type Story = StoryObj< typeof SegmentedBar >;

const baseSegments: SegmentedBarSegment[] = [
	{ id: 'storage', value: 2, label: 'Storage' },
	{ id: 'bandwidth', value: 1, label: 'Bandwidth' },
	{ id: 'compute', value: 0.5, label: 'Compute' },
];

export const Default: Story = {
	args: {
		segments: baseSegments,
		ariaLabel: 'Baseline usage',
	},
};

export const Custom: Story = {
	args: {
		segments: [
			{ id: 'storage', value: 2, color: 'var(--studio-blue-50)', label: 'Storage' },
			{ id: 'bandwidth', value: 1, color: 'var(--studio-green-50)', label: 'Bandwidth' },
			{ id: 'compute', value: 0.5, color: 'var(--studio-orange-40)', label: 'Compute' },
		],
		radius: 8,
		ariaLabel: 'Custom usage',
		gap: 0,
		formatValue: ( value: number ) => {
			return formatCurrency( value, 'USD' );
		},
	},
};
