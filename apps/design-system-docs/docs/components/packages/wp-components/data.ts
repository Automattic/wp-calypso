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
	{
		id: 'base-control',
		name: 'BaseControl',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-basecontrol--docs',
	},
	{
		id: 'border-box-control',
		name: 'BorderBoxControl',
		whereUsed: 'editor',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-borderboxcontrol--docs',
	},
	{
		id: 'border-control',
		name: 'BorderControl',
		whereUsed: 'editor',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-bordercontrol--docs',
	},
	{
		id: 'box-control',
		name: 'BoxControl',
		whereUsed: 'editor',
		status: 'use-with-caution',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=15567-13250',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-boxcontrol--docs',
		notes:
			'Overall design review needed. This component is a fallback for themes that do not supply spacing presets. Most of the time `SpacingSizesControl` is used instead.',
	},
	{
		id: 'button',
		name: 'Button',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=991-34617',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-button--docs',
		notes: 'Stable but needs update. Bloated props and large dependencies.',
	},
	{
		id: 'card',
		name: 'Card',
		whereUsed: 'global',
		status: 'use-with-caution',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-137689',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-card--docs',
		notes: 'Needs usage review and better guidelines.',
	},
	{
		id: 'checkbox-control',
		name: 'CheckboxControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=991-34618',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-checkboxcontrol--docs',
	},
	{
		id: 'circular-option-picker',
		name: 'CircularOptionPicker',
		whereUsed: 'global',
		status: 'use-with-caution',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-149388',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-circularoptionpicker--docs',
		notes: 'Mostly intended for internal use. Needs review for reusability.',
	},
	{
		id: 'color-indicator',
		name: 'ColorIndicator',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-colorindicator--docs',
	},
	{
		id: 'color-palette',
		name: 'ColorPalette',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-149532',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-colorpalette--docs',
	},
	{
		id: 'color-picker',
		name: 'ColorPicker',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-149732',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-colorpicker--docs',
	},
	{
		id: 'combobox-control',
		name: 'ComboboxControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=15598-11365',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-comboboxcontrol--docs',
		notes: 'Stable, but a v2 is planned.',
	},
	{
		id: 'composite',
		name: 'Composite',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-composite--docs',
	},
	{
		id: 'confirm-dialog',
		name: 'ConfirmDialog',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16547-38990',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-confirmdialog--docs',
	},
	{
		id: 'custom-gradient-picker',
		name: 'CustomGradientPicker',
		whereUsed: 'global',
		status: 'not-recommended',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-41873',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-customgradientpicker--docs',
		notes: 'Mostly an internal component. Use `GradientPicker` instead.',
	},
	{
		id: 'custom-select-control',
		name: 'CustomSelectControl',
		whereUsed: 'global',
		status: 'use-with-caution',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-customselectcontrol--docs',
		notes: 'Planned to be superseded by `CustomSelectControlV2`.',
	},
	{
		id: 'custom-select-control-v2',
		name: 'CustomSelectControl v2',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-customselectcontrol-v2--docs',
		notes: 'Still a work in progress.',
	},
	{
		id: 'date-picker',
		name: 'DatePicker',
		whereUsed: 'global',
		status: 'use-with-caution',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-datepicker--docs',
		notes: 'If possible, use `DateCalendar` from `@automattic/components` instead.',
	},
	{
		id: 'date-time-picker',
		name: 'DateTimePicker',
		whereUsed: 'global',
		status: 'use-with-caution',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-datetimepicker--docs',
		notes:
			'If possible, use `DateCalendar` from `@automattic/components` instead. For the input fields, consider using an `InputControl` with `type="datetime-local"`.',
	},
	{
		id: 'disabled',
		name: 'Disabled',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-disabled--docs',
	},
	{
		id: 'divider',
		name: 'Divider',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-divider--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'draggable',
		name: 'Draggable',
		whereUsed: 'global',
		status: 'use-with-caution',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-draggable--docs',
		notes: 'May be deprecated.',
	},
	{
		id: 'dropdown',
		name: 'Dropdown',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-138943',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-dropdown--docs',
	},
	{
		id: 'dropdown-menu',
		name: 'DropdownMenu',
		whereUsed: 'global',
		status: 'use-with-caution',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-dropdownmenu--docs',
		notes: 'If possible, use `Menu` instead.',
	},
	{
		id: 'drop-zone',
		name: 'DropZone',
		whereUsed: 'global',
		status: 'use-with-caution',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-40169',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-dropzone--docs',
		notes: 'Needs design updates.',
	},
	{
		id: 'duotone-picker',
		name: 'DuotonePicker',
		whereUsed: 'editor',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-150251',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-duotonepicker--docs',
	},
	{
		id: 'duotone-swatch',
		name: 'DuotoneSwatch',
		whereUsed: 'editor',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-149894',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-duotoneswatch--docs',
	},
];
