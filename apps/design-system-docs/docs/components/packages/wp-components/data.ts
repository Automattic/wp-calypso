export type ComponentStatus = 'stable' | 'use-with-caution' | 'not-recommended' | 'unaudited';
export type ComponentWhereUsed = 'global' | 'editor';

export type ComponentData = {
	id: string;
	name: string;
	whereUsed: ComponentWhereUsed;
	status: ComponentStatus;
	figma?: string;
	docs: string;
	notes?: string;
};

export const statuses: {
	value: ComponentStatus;
	label: string;
	description: string;
	icon: string;
}[] = [
	{
		value: 'stable',
		label: 'Stable',
		description: 'This component can be used safely.',
		icon: '✅',
	},
	{
		value: 'use-with-caution',
		label: 'Use with caution',
		description: 'See notes.',
		icon: '⚠️',
	},
	{
		value: 'not-recommended',
		label: 'Not recommended',
		description: 'Do not use this component.',
		icon: '🚫',
	},
	{
		value: 'unaudited',
		label: 'Unaudited',
		description:
			'This component has not been audited yet, and is not necessarily recommended for use.',
		icon: '❓',
	},
];

export const data: ComponentData[] = [
	{
		id: 'alignment-matrix-control',
		name: 'AlignmentMatrixControl',
		whereUsed: 'editor',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-139353',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-alignmentmatrixcontrol--docs',
	},
	{
		id: 'angle-picker-control',
		name: 'AnglePickerControl',
		whereUsed: 'editor',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-149161',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-anglepickercontrol--docs',
	},
	{
		id: 'animate',
		name: 'Animate',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-animate--docs',
		notes: 'Planned for deprecation.',
	},
];
