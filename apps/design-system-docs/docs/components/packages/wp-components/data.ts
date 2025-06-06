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
	{
		id: 'elevation',
		name: 'Elevation',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-elevation--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'external-link',
		name: 'ExternalLink',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-137598',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-externallink--docs',
	},
	{
		id: 'flex',
		name: 'Flex',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-flex--docs',
		notes:
			'Planned for deprecation. For use cases not covered by `HStack` and `VStack`, write your own CSS.',
	},
	{
		id: 'focal-point-picker',
		name: 'FocalPointPicker',
		whereUsed: 'editor',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-42220',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-focalpointpicker--docs',
		notes: 'Needs Figma component.',
	},
	{
		id: 'font-size-picker',
		name: 'FontSizePicker',
		whereUsed: 'editor',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-44047',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-fontsizepicker--docs',
	},
	{
		id: 'form-file-upload',
		name: 'FormFileUpload',
		whereUsed: 'global',
		status: 'use-with-caution',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-22089',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-formfileupload--docs',
		notes: 'Needs design update.',
	},
	{
		id: 'form-toggle',
		name: 'FormToggle',
		whereUsed: 'global',
		status: 'use-with-caution',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-formtoggle--docs',
		notes:
			'If possible, use `ToggleControl` instead. (May be absorbed by `ToggleControl` once it supports more customization.)',
	},
	{
		id: 'form-token-field',
		name: 'FormTokenField',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-21625',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-formtokenfield--docs',
		notes: 'Stable, but a v2 is planned.',
	},
	{
		id: 'gradient-picker',
		name: 'GradientPicker',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-42457',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-gradientpicker--docs',
	},
	{
		id: 'grid',
		name: 'Grid',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-grid--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'guide',
		name: 'Guide',
		whereUsed: 'editor',
		status: 'use-with-caution',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-139278',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-guide--docs',
		notes: 'Needs design update. May become a pattern, rather than a standalone component.',
	},
	{
		id: 'h-stack',
		name: 'HStack',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-hstack--docs',
		notes: 'Stable, but a v2 is planned with better defaults.',
	},
	{
		id: 'heading',
		name: 'Heading',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-heading--docs',
		notes:
			'Values are not aligned with the current design system. Prefer using Sass variables from `@wordpress/base-styles` instead.',
	},
	{
		id: 'icon',
		name: 'Icon',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-icon--docs',
		notes: 'Prefer this component over the `Icon` component from `@wordpress/icons`.',
	},
	{
		id: 'input-control',
		name: 'InputControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=991-34623',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-inputcontrol--docs',
	},
	{
		id: 'item-group',
		name: 'ItemGroup',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=2244-18011',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-itemgroup--docs',
	},
	{
		id: 'keyboard-shortcuts',
		name: 'KeyboardShortcuts',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-keyboardshortcuts--docs',
	},
	{
		id: 'menu',
		name: 'Menu',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=991-34615',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-menu--docs',
		notes:
			'If possible, use this component instead of `DropdownMenu`. It may still be marked as private but is pretty much ready.',
	},
	{
		id: 'menu-group',
		name: 'MenuGroup',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-menugroup--docs',
		notes: 'Subcomponent of `DropdownMenu`.',
	},
	{
		id: 'menu-item',
		name: 'MenuItem',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-menuitem--docs',
		notes: 'Subcomponent of `DropdownMenu`.',
	},
	{
		id: 'menu-items-choice',
		name: 'MenuItemsChoice',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-menuitemschoice--docs',
		notes: 'Subcomponent of `DropdownMenu`.',
	},
	{
		id: 'modal',
		name: 'Modal',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=2036-43132',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-modal--docs',
		notes: 'Stable, but a v2 is planned.',
	},
	{
		id: 'navigable-menu',
		name: 'NavigableMenu',
		whereUsed: 'global',
		status: 'unaudited',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-navigablemenu--docs',
	},
	{
		id: 'navigator',
		name: 'Navigator',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-navigator--docs',
	},
	{
		id: 'notice',
		name: 'Notice',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=2274-38167',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-notice--docs',
		notes:
			'A design update is in the works. Search for the "Components: Notice" project on Linear.',
	},
	{
		id: 'number-control',
		name: 'NumberControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-138738',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-numbercontrol--docs',
	},
	{
		id: 'palette-edit',
		name: 'PaletteEdit',
		whereUsed: 'editor',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-paletteedit--docs',
	},
	{
		id: 'panel',
		name: 'Panel',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-138147',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-panel--docs',
	},
	{
		id: 'placeholder',
		name: 'Placeholder',
		whereUsed: 'editor',
		status: 'unaudited',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-137924',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-placeholder--docs',
		notes: 'Needs review.',
	},
	{
		id: 'popover',
		name: 'Popover',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-popover--docs',
	},
	{
		id: 'progress-bar',
		name: 'ProgressBar',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-progressbar--docs',
	},
	{
		id: 'query-controls',
		name: 'QueryControls',
		whereUsed: 'editor',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-querycontrols--docs',
	},
	{
		id: 'radio-control',
		name: 'RadioControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=13532-31910',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-radiocontrol--docs',
	},
	{
		id: 'range-control',
		name: 'RangeControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=991-34621',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-rangecontrol--docs',
		notes: 'Stable, but a more modular v2 is planned.',
	},
	{
		id: 'resizable-box',
		name: 'ResizableBox',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-42695',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-resizablebox--docs',
	},
	{
		id: 'responsive-wrapper',
		name: 'ResponsiveWrapper',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-responsivewrapper--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'sandbox',
		name: 'SandBox',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-sandbox--docs',
	},
	{
		id: 'scrollable',
		name: 'Scrollable',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-scrollable--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'scroll-lock',
		name: 'ScrollLock',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-scrolllock--docs',
	},
	{
		id: 'search-control',
		name: 'SearchControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=3025-46718',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-searchcontrol--docs',
		notes: 'Design may be updated.',
	},
	{
		id: 'select-control',
		name: 'SelectControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=991-41941',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-selectcontrol--docs',
	},
	{
		id: 'shortcut',
		name: 'Shortcut',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-shortcut--docs',
	},
	{
		id: 'slot-fill',
		name: 'SlotFill',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-slotfill--docs',
	},
	{
		id: 'snackbar',
		name: 'Snackbar',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=2274-38166',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-snackbar--docs',
		notes: 'May need design update.',
	},
	{
		id: 'snackbar-list',
		name: 'SnackbarList',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-40546',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-snackbarlist--docs',
	},
	{
		id: 'spacer',
		name: 'Spacer',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-spacer--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'spinner',
		name: 'Spinner',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=3343-37987',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-spinner--docs',
	},
	{
		id: 'surface',
		name: 'Surface',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-surface--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'tabbable-container',
		name: 'TabbableContainer',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-tabbablecontainer--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'tab-panel',
		name: 'TabPanel',
		whereUsed: 'global',
		status: 'use-with-caution',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-tabpanel--docs',
		notes: 'Will be deprecated in favor of `Tabs`.',
	},
	{
		id: 'tabs',
		name: 'Tabs',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=991-34616',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-tabs--docs',
		notes: 'If possible, use this component instead of `TabPanel`.',
	},
	{
		id: 'text',
		name: 'Text',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-text--docs',
		notes:
			'Values are not aligned with the current design system. Prefer using Sass variables from `@wordpress/base-styles` instead.',
	},
	{
		id: 'textarea-control',
		name: 'TextareaControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=2518-56299',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-textareacontrol--docs',
	},
	{
		id: 'text-control',
		name: 'TextControl',
		whereUsed: 'global',
		status: 'use-with-caution',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-textcontrol--docs',
		notes: 'Will be deprecated in favor of `InputControl`.',
	},
	{
		id: 'text-highlight',
		name: 'TextHighlight',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-texthighlight--docs',
	},
	{
		id: 'theme',
		name: 'Theme',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-theme--docs',
		notes:
			'This is an internal experiment and not meant for external use. An official theming solution is in the works.',
	},
	{
		id: 'time-picker',
		name: 'TimePicker',
		whereUsed: 'global',
		status: 'use-with-caution',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16530-21978',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-timepicker--docs',
		notes: 'Consider using an `InputControl` with `type="datetime-local"` instead.',
	},
	{
		id: 'tip',
		name: 'Tip',
		whereUsed: 'global',
		status: 'unaudited',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-tip--docs',
		notes: 'Needs review.',
	},
	{
		id: 'toggle-control',
		name: 'ToggleControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=991-34620',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-togglecontrol--docs',
	},
	{
		id: 'toggle-group-control',
		name: 'ToggleGroupControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=2244-1941',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-togglegroupcontrol--docs',
		notes: 'Stable, but design may be updated.',
	},
	{
		id: 'toolbar',
		name: 'Toolbar',
		whereUsed: 'editor',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=13919-17541',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-toolbar--docs',
		notes: 'Stable, but design may be updated.',
	},
	{
		id: 'tools-panel',
		name: 'ToolsPanel',
		whereUsed: 'editor',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-toolspanel--docs',
	},
	{
		id: 'tooltip',
		name: 'Tooltip',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=13919-17539',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-tooltip--docs',
	},
	{
		id: 'tree-grid',
		name: 'TreeGrid',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-treegrid--docs',
	},
	{
		id: 'tree-select',
		name: 'TreeSelect',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-treeselect--docs',
	},
	{
		id: 'truncate',
		name: 'Truncate',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-truncate--docs',
	},
	{
		id: 'unit-control',
		name: 'UnitControl',
		whereUsed: 'global',
		status: 'stable',
		figma:
			'https://www.figma.com/design/804HN2REV2iap2ytjRQ055/WordPress-Design-System?node-id=16471-138481',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-unitcontrol--docs',
	},
	{
		id: 'v-stack',
		name: 'VStack',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-vstack--docs',
		notes: 'Stable, but a v2 is planned with better defaults.',
	},
	{
		id: 'view',
		name: 'View',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-view--docs',
		notes: 'Planned for deprecation.',
	},
	{
		id: 'visually-hidden',
		name: 'VisuallyHidden',
		whereUsed: 'global',
		status: 'stable',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-visuallyhidden--docs',
	},
	{
		id: 'z-stack',
		name: 'ZStack',
		whereUsed: 'global',
		status: 'not-recommended',
		docs: 'https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-zstack--docs',
		notes: 'Planned for deprecation.',
	},
];
