/**
 * Babel plugin to rewrite @wordpress/components barrel imports to direct subpath imports.
 *
 * Transforms:
 *   import { Button, Modal, CardBody } from '@wordpress/components';
 * Into:
 *   import { Button } from '@wp-components-direct/button/index.mjs';
 *   import { Modal } from '@wp-components-direct/modal/index.mjs';
 *   import { CardBody } from '@wp-components-direct/card/index.mjs';
 *
 * This avoids pulling in the entire barrel re-export which includes 180+ components.
 *
 * Generated from @wordpress/components build-module/index.mjs barrel analysis.
 */

// Maps exported name -> { subpath, exportName }
// subpath: the subdirectory under build-module/
// exportName: the actual export name in the subpath module
//   - 'default' means use `import { default as X }`
//   - any other name means use `import { exportName as X }` (or `import { X }` if names match)
const MAPPING = {
	__experimentalAlignmentMatrixControl: {
		subpath: 'alignment-matrix-control',
		exportName: 'default',
	},
	__experimentalBorderBoxControl: { subpath: 'border-box-control', exportName: 'BorderBoxControl' },
	__experimentalBorderControl: { subpath: 'border-control', exportName: 'BorderControl' },
	__experimentalBoxControl: { subpath: 'box-control', exportName: 'default' },
	__experimentalConfirmDialog: { subpath: 'confirm-dialog', exportName: 'ConfirmDialog' },
	__experimentalDivider: { subpath: 'divider', exportName: 'Divider' },
	__experimentalDropdownContentWrapper: {
		subpath: 'dropdown/dropdown-content-wrapper',
		exportName: 'default',
	},
	__experimentalElevation: { subpath: 'elevation', exportName: 'Elevation' },
	__experimentalGrid: { subpath: 'grid', exportName: 'Grid' },
	__experimentalHeading: { subpath: 'heading', exportName: 'Heading' },
	__experimentalHStack: { subpath: 'h-stack', exportName: 'HStack' },
	__experimentalInputControl: { subpath: 'input-control', exportName: 'default' },
	__experimentalInputControlPrefixWrapper: {
		subpath: 'input-control/input-prefix-wrapper',
		exportName: 'default',
	},
	__experimentalInputControlSuffixWrapper: {
		subpath: 'input-control/input-suffix-wrapper',
		exportName: 'default',
	},
	__experimentalItem: { subpath: 'item-group', exportName: 'Item' },
	__experimentalItemGroup: { subpath: 'item-group', exportName: 'ItemGroup' },
	__experimentalNavigation: { subpath: 'navigation', exportName: 'default' },
	__experimentalNavigationBackButton: { subpath: 'navigation/back-button', exportName: 'default' },
	__experimentalNavigationGroup: { subpath: 'navigation/group', exportName: 'default' },
	__experimentalNavigationItem: { subpath: 'navigation/item', exportName: 'default' },
	__experimentalNavigationMenu: { subpath: 'navigation/menu', exportName: 'default' },
	__experimentalNumberControl: { subpath: 'number-control', exportName: 'default' },
	__experimentalPaletteEdit: { subpath: 'palette-edit', exportName: 'default' },
	__experimentalRadio: { subpath: 'radio-group/radio', exportName: 'default' },
	__experimentalRadioGroup: { subpath: 'radio-group', exportName: 'default' },
	__experimentalScrollable: { subpath: 'scrollable', exportName: 'Scrollable' },
	__experimentalSpacer: { subpath: 'spacer', exportName: 'Spacer' },
	__experimentalStyleProvider: { subpath: 'style-provider', exportName: 'default' },
	__experimentalSurface: { subpath: 'surface', exportName: 'Surface' },
	__experimentalText: { subpath: 'text', exportName: 'Text' },
	__experimentalToggleGroupControl: {
		subpath: 'toggle-group-control',
		exportName: 'ToggleGroupControl',
	},
	__experimentalToggleGroupControlOption: {
		subpath: 'toggle-group-control',
		exportName: 'ToggleGroupControlOption',
	},
	__experimentalToggleGroupControlOptionIcon: {
		subpath: 'toggle-group-control',
		exportName: 'ToggleGroupControlOptionIcon',
	},
	__experimentalTreeGrid: { subpath: 'tree-grid', exportName: 'default' },
	__experimentalTreeGridCell: { subpath: 'tree-grid', exportName: 'TreeGridCell' },
	__experimentalTreeGridItem: { subpath: 'tree-grid', exportName: 'TreeGridItem' },
	__experimentalTreeGridRow: { subpath: 'tree-grid', exportName: 'TreeGridRow' },
	__experimentalTruncate: { subpath: 'truncate', exportName: 'Truncate' },
	__experimentalUseNavigator: { subpath: 'navigator', exportName: 'useNavigator' },
	__experimentalVStack: { subpath: 'v-stack', exportName: 'VStack' },
	__experimentalView: { subpath: 'view', exportName: 'View' },
	__experimentalZStack: { subpath: 'z-stack', exportName: 'ZStack' },
	AlignmentMatrixControl: {
		subpath: 'alignment-matrix-control',
		exportName: 'AlignmentMatrixControl',
	},
	AnglePickerControl: { subpath: 'angle-picker-control', exportName: 'AnglePickerControl' },
	Animate: { subpath: 'animate', exportName: 'Animate' },
	Autocomplete: { subpath: 'autocomplete', exportName: 'default' },
	BaseControl: { subpath: 'base-control', exportName: 'BaseControl' },
	BorderBoxControl: { subpath: 'border-box-control', exportName: 'BorderBoxControl' },
	BorderControl: { subpath: 'border-control', exportName: 'BorderControl' },
	BoxControl: { subpath: 'box-control', exportName: 'default' },
	Button: { subpath: 'button', exportName: 'Button' },
	ButtonGroup: { subpath: 'button-group', exportName: 'ButtonGroup' },
	Card: { subpath: 'card', exportName: 'Card' },
	CardBody: { subpath: 'card', exportName: 'CardBody' },
	CardDivider: { subpath: 'card', exportName: 'CardDivider' },
	CardFooter: { subpath: 'card', exportName: 'CardFooter' },
	CardHeader: { subpath: 'card', exportName: 'CardHeader' },
	CardMedia: { subpath: 'card', exportName: 'CardMedia' },
	CheckboxControl: { subpath: 'checkbox-control', exportName: 'CheckboxControl' },
	ColorIndicator: { subpath: 'color-indicator', exportName: 'ColorIndicator' },
	ColorPalette: { subpath: 'color-palette', exportName: 'ColorPalette' },
	ColorPicker: { subpath: 'color-picker', exportName: 'ColorPicker' },
	ComboboxControl: { subpath: 'combobox-control', exportName: 'default' },
	Composite: { subpath: 'composite', exportName: 'Composite' },
	CustomGradientPicker: { subpath: 'custom-gradient-picker', exportName: 'CustomGradientPicker' },
	CustomSelectControl: { subpath: 'custom-select-control', exportName: 'default' },
	Dashicon: { subpath: 'dashicon', exportName: 'default' },
	DatePicker: { subpath: 'date-time', exportName: 'DatePicker' },
	DateTimePicker: { subpath: 'date-time', exportName: 'default' },
	Disabled: { subpath: 'disabled', exportName: 'default' },
	Draggable: { subpath: 'draggable', exportName: 'Draggable' },
	Dropdown: { subpath: 'dropdown', exportName: 'Dropdown' },
	DropdownMenu: { subpath: 'dropdown-menu', exportName: 'DropdownMenu' },
	DropZone: { subpath: 'drop-zone', exportName: 'default' },
	DuotonePicker: { subpath: 'duotone-picker', exportName: 'DuotonePicker' },
	DuotoneSwatch: { subpath: 'duotone-picker', exportName: 'DuotoneSwatch' },
	ExternalLink: { subpath: 'external-link', exportName: 'ExternalLink' },
	Fill: { subpath: 'slot-fill', exportName: 'Fill' },
	Flex: { subpath: 'flex', exportName: 'Flex' },
	FlexBlock: { subpath: 'flex', exportName: 'FlexBlock' },
	FlexItem: { subpath: 'flex', exportName: 'FlexItem' },
	FocalPointPicker: { subpath: 'focal-point-picker', exportName: 'FocalPointPicker' },
	FontSizePicker: { subpath: 'font-size-picker', exportName: 'FontSizePicker' },
	FormFileUpload: { subpath: 'form-file-upload', exportName: 'FormFileUpload' },
	FormToggle: { subpath: 'form-toggle', exportName: 'FormToggle' },
	FormTokenField: { subpath: 'form-token-field', exportName: 'FormTokenField' },
	GradientPicker: { subpath: 'gradient-picker', exportName: 'GradientPicker' },
	Guide: { subpath: 'guide', exportName: 'default' },
	GuidePage: { subpath: 'guide/page', exportName: 'default' },
	Icon: { subpath: 'icon', exportName: 'default' },
	KeyboardShortcuts: { subpath: 'keyboard-shortcuts', exportName: 'default' },
	MenuGroup: { subpath: 'menu-group', exportName: 'MenuGroup' },
	MenuItem: { subpath: 'menu-item', exportName: 'MenuItem' },
	MenuItemsChoice: { subpath: 'menu-items-choice', exportName: 'default' },
	Modal: { subpath: 'modal', exportName: 'Modal' },
	NavigableMenu: { subpath: 'navigable-container', exportName: 'NavigableMenu' },
	Navigator: { subpath: 'navigator', exportName: 'Navigator' },
	Notice: { subpath: 'notice', exportName: 'default' },
	NoticeList: { subpath: 'notice/list', exportName: 'default' },
	Panel: { subpath: 'panel', exportName: 'Panel' },
	PanelBody: { subpath: 'panel/body', exportName: 'PanelBody' },
	PanelHeader: { subpath: 'panel/header', exportName: 'default' },
	PanelRow: { subpath: 'panel/row', exportName: 'PanelRow' },
	Placeholder: { subpath: 'placeholder', exportName: 'Placeholder' },
	Popover: { subpath: 'popover', exportName: 'Popover' },
	privateApis: { subpath: 'private-apis', exportName: 'privateApis' },
	ProgressBar: { subpath: 'progress-bar', exportName: 'ProgressBar' },
	QueryControls: { subpath: 'query-controls', exportName: 'QueryControls' },
	RadioControl: { subpath: 'radio-control', exportName: 'RadioControl' },
	RangeControl: { subpath: 'range-control', exportName: 'RangeControl' },
	ResizableBox: { subpath: 'resizable-box', exportName: 'ResizableBox' },
	ResponsiveWrapper: { subpath: 'responsive-wrapper', exportName: 'default' },
	SandBox: { subpath: 'sandbox', exportName: 'default' },
	ScrollLock: { subpath: 'scroll-lock', exportName: 'ScrollLock' },
	SearchControl: { subpath: 'search-control', exportName: 'SearchControl' },
	SelectControl: { subpath: 'select-control', exportName: 'SelectControl' },
	Slot: { subpath: 'slot-fill', exportName: 'Slot' },
	SlotFillProvider: { subpath: 'slot-fill', exportName: 'Provider' },
	Snackbar: { subpath: 'snackbar', exportName: 'Snackbar' },
	SnackbarList: { subpath: 'snackbar/list', exportName: 'SnackbarList' },
	Spinner: { subpath: 'spinner', exportName: 'Spinner' },
	TabbableContainer: { subpath: 'navigable-container', exportName: 'TabbableContainer' },
	TabPanel: { subpath: 'tab-panel', exportName: 'TabPanel' },
	TextareaControl: { subpath: 'textarea-control', exportName: 'TextareaControl' },
	TextControl: { subpath: 'text-control', exportName: 'TextControl' },
	TextHighlight: { subpath: 'text-highlight', exportName: 'TextHighlight' },
	TimePicker: { subpath: 'date-time', exportName: 'TimePicker' },
	Tip: { subpath: 'tip', exportName: 'Tip' },
	ToggleControl: { subpath: 'toggle-control', exportName: 'ToggleControl' },
	Toolbar: { subpath: 'toolbar', exportName: 'Toolbar' },
	ToolbarButton: { subpath: 'toolbar', exportName: 'ToolbarButton' },
	ToolbarDropdownMenu: { subpath: 'toolbar', exportName: 'ToolbarDropdownMenu' },
	ToolbarGroup: { subpath: 'toolbar', exportName: 'ToolbarGroup' },
	ToolbarItem: { subpath: 'toolbar', exportName: 'ToolbarItem' },
	Tooltip: { subpath: 'tooltip', exportName: 'Tooltip' },
	TreeSelect: { subpath: 'tree-select', exportName: 'TreeSelect' },
	useNavigator: { subpath: 'navigator', exportName: 'useNavigator' },
	VisuallyHidden: { subpath: 'visually-hidden', exportName: 'VisuallyHidden' },
};

// Components that use a .mjs file directly (no /index.mjs subdirectory)
const FLAT_FILES = new Set( [
	'private-apis',
	'drop-zone/provider',
	'guide/page',
	'button/deprecated',
	'notice/list',
	'panel/body',
	'panel/header',
	'panel/row',
	'snackbar/list',
	'dropdown/dropdown-content-wrapper',
	'input-control/input-prefix-wrapper',
	'input-control/input-suffix-wrapper',
	'navigator/legacy',
	'radio-group/radio',
] );

// Use a virtual alias prefix to bypass the @wordpress/components exports field.
// The webpack config maps @wp-components-direct/ to the actual build-module directory.
function getSourcePath( subpath ) {
	const suffix = FLAT_FILES.has( subpath ) ? '.mjs' : '/index.mjs';
	return `@wp-components-direct/${ subpath }${ suffix }`;
}

module.exports = function () {
	return {
		visitor: {
			ImportDeclaration( nodePath ) {
				if ( nodePath.node.source.value !== '@wordpress/components' ) {
					return;
				}

				const specifiers = nodePath.node.specifiers;
				if ( ! specifiers.length ) {
					return;
				}

				// Skip if there's a default or namespace import
				if (
					specifiers.some(
						( s ) => s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier'
					)
				) {
					return;
				}

				// Group specifiers by their target subpath to combine imports
				const groups = new Map(); // subpath -> [{ exportName, local }]
				const unmapped = [];

				for ( const specifier of specifiers ) {
					if ( specifier.type !== 'ImportSpecifier' ) {
						unmapped.push( specifier );
						continue;
					}

					// Skip type-only imports
					if ( specifier.importKind === 'type' ) {
						unmapped.push( specifier );
						continue;
					}

					const importedName =
						specifier.imported.type === 'StringLiteral'
							? specifier.imported.value
							: specifier.imported.name;
					const mapping = MAPPING[ importedName ];

					if ( ! mapping ) {
						unmapped.push( specifier );
						continue;
					}

					const key = mapping.subpath;
					if ( ! groups.has( key ) ) {
						groups.set( key, [] );
					}
					groups.get( key ).push( {
						exportName: mapping.exportName,
						local: specifier.local,
					} );
				}

				if ( groups.size === 0 ) {
					return; // Nothing to transform
				}

				const newImports = [];
				for ( const [ subpath, items ] of groups ) {
					const source = getSourcePath( subpath );
					const importSpecifiers = items.map( ( { exportName, local } ) => {
						return {
							type: 'ImportSpecifier',
							imported: { type: 'Identifier', name: exportName },
							local,
						};
					} );

					newImports.push( {
						type: 'ImportDeclaration',
						specifiers: importSpecifiers,
						source: { type: 'StringLiteral', value: source },
						importKind: 'value',
					} );
				}

				if ( unmapped.length > 0 && newImports.length > 0 ) {
					// Keep barrel import for unmapped, add new imports
					nodePath.node.specifiers = unmapped;
					for ( const imp of newImports.reverse() ) {
						nodePath.insertAfter( imp );
					}
				} else if ( unmapped.length === 0 ) {
					// All mapped — replace entirely
					for ( let i = 1; i < newImports.length; i++ ) {
						nodePath.insertAfter( newImports[ i ] );
					}
					nodePath.replaceWith( newImports[ 0 ] );
				}
			},
		},
	};
};
