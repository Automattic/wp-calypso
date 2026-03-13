/**
 * Babel plugin to rewrite @wordpress/components barrel imports to direct subpath imports.
 *
 * Transforms:
 *   import { Button, Modal, CardBody } from '@wordpress/components';
 * Into:
 *   import { default as Button } from '@wordpress/components/build-module/button/index.mjs';
 *   import { default as Modal } from '@wordpress/components/build-module/modal/index.mjs';
 *   import { CardBody } from '@wordpress/components/build-module/card/index.mjs';
 *
 * This avoids pulling in the entire barrel re-export which includes 180+ components.
 *
 * Generated from @wordpress/components build-module/index.mjs barrel analysis.
 */

// Maps exported name -> { subpath, isDefault }
// isDefault: true means the component is the default export of the subpath module
// isDefault: false means the component is a named export of the subpath module
const MAPPING = {
	__experimentalAlignmentMatrixControl: { subpath: 'alignment-matrix-control', isDefault: true },
	__experimentalBorderBoxControl: { subpath: 'border-box-control', isDefault: true },
	__experimentalBorderControl: { subpath: 'border-control', isDefault: true },
	__experimentalBoxControl: { subpath: 'box-control', isDefault: true },
	__experimentalConfirmDialog: { subpath: 'confirm-dialog', isDefault: true },
	__experimentalDivider: { subpath: 'divider', isDefault: true },
	__experimentalDropdownContentWrapper: {
		subpath: 'dropdown/dropdown-content-wrapper',
		isDefault: true,
	},
	__experimentalElevation: { subpath: 'elevation', isDefault: true },
	__experimentalGrid: { subpath: 'grid', isDefault: true },
	__experimentalHeading: { subpath: 'heading', isDefault: true },
	__experimentalHStack: { subpath: 'h-stack', isDefault: true },
	__experimentalInputControl: { subpath: 'input-control', isDefault: true },
	__experimentalInputControlPrefixWrapper: {
		subpath: 'input-control/input-prefix-wrapper',
		isDefault: true,
	},
	__experimentalInputControlSuffixWrapper: {
		subpath: 'input-control/input-suffix-wrapper',
		isDefault: true,
	},
	__experimentalItem: { subpath: 'item-group', isDefault: true },
	__experimentalItemGroup: { subpath: 'item-group', isDefault: true },
	__experimentalNavigation: { subpath: 'navigation', isDefault: true },
	__experimentalNavigationBackButton: { subpath: 'navigation/back-button', isDefault: true },
	__experimentalNavigationGroup: { subpath: 'navigation/group', isDefault: true },
	__experimentalNavigationItem: { subpath: 'navigation/item', isDefault: true },
	__experimentalNavigationMenu: { subpath: 'navigation/menu', isDefault: true },
	__experimentalNumberControl: { subpath: 'number-control', isDefault: true },
	__experimentalPaletteEdit: { subpath: 'palette-edit', isDefault: true },
	__experimentalRadio: { subpath: 'radio-group/radio', isDefault: true },
	__experimentalRadioGroup: { subpath: 'radio-group', isDefault: true },
	__experimentalScrollable: { subpath: 'scrollable', isDefault: true },
	__experimentalSpacer: { subpath: 'spacer', isDefault: true },
	__experimentalStyleProvider: { subpath: 'style-provider', isDefault: true },
	__experimentalSurface: { subpath: 'surface', isDefault: true },
	__experimentalText: { subpath: 'text', isDefault: true },
	__experimentalToggleGroupControl: { subpath: 'toggle-group-control', isDefault: true },
	__experimentalToggleGroupControlOption: { subpath: 'toggle-group-control', isDefault: false },
	__experimentalToggleGroupControlOptionIcon: { subpath: 'toggle-group-control', isDefault: false },
	__experimentalTreeGrid: { subpath: 'tree-grid', isDefault: true },
	__experimentalTreeGridCell: { subpath: 'tree-grid', isDefault: false },
	__experimentalTreeGridItem: { subpath: 'tree-grid', isDefault: false },
	__experimentalTreeGridRow: { subpath: 'tree-grid', isDefault: false },
	__experimentalTruncate: { subpath: 'truncate', isDefault: true },
	__experimentalUseNavigator: { subpath: 'navigator', isDefault: false },
	__experimentalVStack: { subpath: 'v-stack', isDefault: true },
	__experimentalView: { subpath: 'view', isDefault: true },
	__experimentalZStack: { subpath: 'z-stack', isDefault: true },
	AlignmentMatrixControl: { subpath: 'alignment-matrix-control', isDefault: true },
	AnglePickerControl: { subpath: 'angle-picker-control', isDefault: true },
	Animate: { subpath: 'animate', isDefault: true },
	Autocomplete: { subpath: 'autocomplete', isDefault: true },
	BaseControl: { subpath: 'base-control', isDefault: true },
	BorderBoxControl: { subpath: 'border-box-control', isDefault: true },
	BorderControl: { subpath: 'border-control', isDefault: true },
	BoxControl: { subpath: 'box-control', isDefault: true },
	Button: { subpath: 'button', isDefault: true },
	ButtonGroup: { subpath: 'button-group', isDefault: true },
	Card: { subpath: 'card', isDefault: false },
	CardBody: { subpath: 'card', isDefault: false },
	CardDivider: { subpath: 'card', isDefault: false },
	CardFooter: { subpath: 'card', isDefault: false },
	CardHeader: { subpath: 'card', isDefault: false },
	CardMedia: { subpath: 'card', isDefault: false },
	CheckboxControl: { subpath: 'checkbox-control', isDefault: true },
	ColorIndicator: { subpath: 'color-indicator', isDefault: true },
	ColorPalette: { subpath: 'color-palette', isDefault: true },
	ColorPicker: { subpath: 'color-picker', isDefault: true },
	ComboboxControl: { subpath: 'combobox-control', isDefault: true },
	Composite: { subpath: 'composite', isDefault: true },
	CustomGradientPicker: { subpath: 'custom-gradient-picker', isDefault: true },
	CustomSelectControl: { subpath: 'custom-select-control', isDefault: true },
	Dashicon: { subpath: 'dashicon', isDefault: true },
	DatePicker: { subpath: 'date-time', isDefault: false },
	DateTimePicker: { subpath: 'date-time', isDefault: false },
	Disabled: { subpath: 'disabled', isDefault: true },
	Draggable: { subpath: 'draggable', isDefault: true },
	Dropdown: { subpath: 'dropdown', isDefault: true },
	DropdownMenu: { subpath: 'dropdown-menu', isDefault: true },
	DropZone: { subpath: 'drop-zone', isDefault: true },
	DuotonePicker: { subpath: 'duotone-picker', isDefault: false },
	DuotoneSwatch: { subpath: 'duotone-picker', isDefault: false },
	ExternalLink: { subpath: 'external-link', isDefault: true },
	Fill: { subpath: 'slot-fill', isDefault: false },
	Flex: { subpath: 'flex', isDefault: false },
	FlexBlock: { subpath: 'flex', isDefault: false },
	FlexItem: { subpath: 'flex', isDefault: false },
	FocalPointPicker: { subpath: 'focal-point-picker', isDefault: true },
	FontSizePicker: { subpath: 'font-size-picker', isDefault: true },
	FormFileUpload: { subpath: 'form-file-upload', isDefault: true },
	FormToggle: { subpath: 'form-toggle', isDefault: true },
	FormTokenField: { subpath: 'form-token-field', isDefault: true },
	GradientPicker: { subpath: 'gradient-picker', isDefault: true },
	Guide: { subpath: 'guide', isDefault: true },
	GuidePage: { subpath: 'guide/page', isDefault: true },
	Icon: { subpath: 'icon', isDefault: true },
	KeyboardShortcuts: { subpath: 'keyboard-shortcuts', isDefault: true },
	MenuGroup: { subpath: 'menu-group', isDefault: true },
	MenuItem: { subpath: 'menu-item', isDefault: true },
	MenuItemsChoice: { subpath: 'menu-items-choice', isDefault: true },
	Modal: { subpath: 'modal', isDefault: true },
	NavigableMenu: { subpath: 'navigable-container', isDefault: false },
	Navigator: { subpath: 'navigator', isDefault: true },
	Notice: { subpath: 'notice', isDefault: true },
	NoticeList: { subpath: 'notice/list', isDefault: true },
	Panel: { subpath: 'panel', isDefault: true },
	PanelBody: { subpath: 'panel/body', isDefault: true },
	PanelHeader: { subpath: 'panel/header', isDefault: true },
	PanelRow: { subpath: 'panel/row', isDefault: true },
	Placeholder: { subpath: 'placeholder', isDefault: true },
	Popover: { subpath: 'popover', isDefault: true },
	privateApis: { subpath: 'private-apis', isDefault: false },
	ProgressBar: { subpath: 'progress-bar', isDefault: true },
	QueryControls: { subpath: 'query-controls', isDefault: true },
	RadioControl: { subpath: 'radio-control', isDefault: true },
	RangeControl: { subpath: 'range-control', isDefault: true },
	ResizableBox: { subpath: 'resizable-box', isDefault: true },
	ResponsiveWrapper: { subpath: 'responsive-wrapper', isDefault: true },
	SandBox: { subpath: 'sandbox', isDefault: true },
	ScrollLock: { subpath: 'scroll-lock', isDefault: true },
	SearchControl: { subpath: 'search-control', isDefault: true },
	SelectControl: { subpath: 'select-control', isDefault: true },
	Slot: { subpath: 'slot-fill', isDefault: false },
	SlotFillProvider: { subpath: 'slot-fill', isDefault: false },
	Snackbar: { subpath: 'snackbar', isDefault: true },
	SnackbarList: { subpath: 'snackbar/list', isDefault: true },
	Spinner: { subpath: 'spinner', isDefault: true },
	TabbableContainer: { subpath: 'navigable-container', isDefault: false },
	TabPanel: { subpath: 'tab-panel', isDefault: true },
	TextareaControl: { subpath: 'textarea-control', isDefault: true },
	TextControl: { subpath: 'text-control', isDefault: true },
	TextHighlight: { subpath: 'text-highlight', isDefault: true },
	TimePicker: { subpath: 'date-time', isDefault: false },
	Tip: { subpath: 'tip', isDefault: true },
	ToggleControl: { subpath: 'toggle-control', isDefault: true },
	Toolbar: { subpath: 'toolbar', isDefault: true },
	ToolbarButton: { subpath: 'toolbar', isDefault: false },
	ToolbarDropdownMenu: { subpath: 'toolbar', isDefault: false },
	ToolbarGroup: { subpath: 'toolbar', isDefault: false },
	ToolbarItem: { subpath: 'toolbar', isDefault: false },
	Tooltip: { subpath: 'tooltip', isDefault: true },
	TreeSelect: { subpath: 'tree-select', isDefault: true },
	useNavigator: { subpath: 'navigator', isDefault: false },
	VisuallyHidden: { subpath: 'visually-hidden', isDefault: true },
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

function getSourcePath( subpath ) {
	const suffix = FLAT_FILES.has( subpath ) ? '.mjs' : '/index.mjs';
	return `@wordpress/components/build-module/${ subpath }${ suffix }`;
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
				const groups = new Map(); // subpath -> [{ importedName, localName, isDefault }]
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
						importedName,
						local: specifier.local,
						isDefault: mapping.isDefault,
					} );
				}

				if ( groups.size === 0 ) {
					return; // Nothing to transform
				}

				const newImports = [];
				for ( const [ subpath, items ] of groups ) {
					const source = getSourcePath( subpath );
					const importSpecifiers = items.map( ( { importedName, local, isDefault } ) => {
						if ( isDefault ) {
							return {
								type: 'ImportSpecifier',
								imported: { type: 'Identifier', name: 'default' },
								local,
							};
						}
						return {
							type: 'ImportSpecifier',
							imported: { type: 'Identifier', name: importedName },
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
