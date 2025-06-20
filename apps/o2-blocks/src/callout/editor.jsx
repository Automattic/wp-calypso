import { InnerBlocks, InspectorControls, ColorPalette } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { CustomSelectControl, PanelBody, Button, Dashicon } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import {
	CALLOUT_TEMPLATE_DEFAULT_COLOR,
	CALLOUT_TEMPLATES,
	CALLOUT_PANEL_COLORS,
	CALLOUT_PANEL_DASHICONS,
} from './constants';
import { transforms } from './transform';

import './style.scss';

// Utility functions
const getIcon = ( templateName, customIcon = '' ) => {
	if ( customIcon ) {
		return customIcon.startsWith( 'dashicons-' ) ? customIcon : `dashicons-${ customIcon }`;
	}

	return CALLOUT_TEMPLATES[ templateName ]?.icon || CALLOUT_TEMPLATES.custom.icon;
};

const isValidColor = ( color ) => {
	if ( ! color || typeof color !== 'string' ) {
		return false;
	}

	return /^#[0-9A-F]{6}$/i.test( color );
};

const normalizeColor = ( color ) => {
	if ( ! isValidColor( color ) ) {
		return CALLOUT_TEMPLATE_DEFAULT_COLOR;
	}

	return color;
};

const getCurrentColor = ( templateName, customColor ) => {
	return templateName === 'custom'
		? normalizeColor( customColor ) || CALLOUT_TEMPLATE_DEFAULT_COLOR
		: CALLOUT_TEMPLATES[ templateName ]?.color || CALLOUT_TEMPLATES.custom.color;
};

// === CUSTOM HOOKS ===

const useCalloutAttributes = ( attributes ) => {
	const {
		calloutTemplate: templateName = 'custom',
		customColor = CALLOUT_TEMPLATE_DEFAULT_COLOR,
		customIcon = '',
	} = attributes;

	return { templateName, customColor, customIcon };
};

const useCalloutStyles = ( templateName, customColor ) => {
	const currentColor = getCurrentColor( templateName, customColor );
	const customStyle =
		templateName === 'custom'
			? { '--custom-color': normalizeColor( customColor ) || CALLOUT_TEMPLATE_DEFAULT_COLOR }
			: {};

	return { currentColor, customStyle };
};

// Hook for block editor functionality
const useBlockEditor = ( clientId ) => {
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );
	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	return { innerBlocks, updateBlockAttributes };
};

const useTemplateHandler = ( templateName, customIcon, setAttributes, updateIconBlock ) => {
	return useCallback(
		( { selectedItem } ) => {
			if ( selectedItem?.key && selectedItem.key !== templateName ) {
				const newAttributes = { calloutTemplate: selectedItem.key };
				const newCustomIcon = selectedItem.key !== 'custom' && customIcon ? '' : customIcon;

				// Clear custom icon when switching to a template type (non-custom)
				if ( selectedItem.key !== 'custom' && customIcon ) {
					newAttributes.customIcon = '';
				}

				// Update both the attributes and the icon block synchronously
				setAttributes( newAttributes );
				updateIconBlock( selectedItem.key, newCustomIcon );
			}
		},
		[ templateName, customIcon, setAttributes, updateIconBlock ]
	);
};

const useColorHandler = ( customColor, setAttributes ) => {
	return useCallback(
		( color ) => {
			const normalizedColor = normalizeColor( color );
			if ( normalizedColor !== customColor ) {
				setAttributes( { customColor: normalizedColor } );
			}
		},
		[ customColor, setAttributes ]
	);
};

const useIconHandler = ( customIcon, templateName, setAttributes, updateIconBlock ) => {
	return useCallback(
		( iconName ) => {
			if ( iconName !== customIcon ) {
				// Update both the attributes and the icon block synchronously
				setAttributes( { customIcon: iconName } );
				updateIconBlock( templateName, iconName );
			}
		},
		[ customIcon, setAttributes, templateName, updateIconBlock ]
	);
};

// === COMPONENTS ===

const IconPicker = ( { customIcon, currentColor, onIconChange, templateName } ) => {
	// Get the current icon being displayed by a template, if a template is being used
	const currentIconName = getIcon( templateName, customIcon );

	return (
		<div className="o2-blocks-callout__icon-picker">
			<div className="o2-blocks-callout__icon-picker-grid">
				{ CALLOUT_PANEL_DASHICONS.map( ( iconName ) => {
					const isSelected = currentIconName === iconName;
					const iconNameWithoutPrefix = iconName.replace( 'dashicons-', '' );

					return (
						<Button
							key={ iconName }
							onClick={ () => onIconChange( iconName ) }
							variant="secondary"
							className={ `o2-blocks-callout__icon-picker-button${
								isSelected ? ' o2-blocks-callout__icon-picker-button--selected' : ''
							}` }
							style={ {
								borderColor: isSelected ? currentColor : undefined,
							} }
							title={ iconName }
						>
							<Dashicon
								icon={ iconNameWithoutPrefix }
								size={ 20 }
								style={ { color: currentColor } }
							/>
						</Button>
					);
				} ) }
			</div>
			<div className="o2-blocks-callout__icon-picker-selected-info">
				{ __( 'Selected:' ) } { currentIconName }
			</div>
		</div>
	);
};

const TemplateControls = ( { templateName, onChange } ) => {
	const selectedTemplateName = Object.entries( CALLOUT_TEMPLATES )
		.map( ( [ key, value ] ) => ( { key, name: value.name } ) )
		.find( ( option ) => option.key === templateName ) || {
		key: 'custom',
		name: CALLOUT_TEMPLATES.custom.name,
	};

	return (
		<PanelBody title={ __( 'Templates' ) }>
			<CustomSelectControl
				options={ Object.entries( CALLOUT_TEMPLATES ).map( ( [ key, value ] ) => ( {
					key,
					name: value.name,
				} ) ) }
				value={ selectedTemplateName }
				onChange={ onChange }
			/>
		</PanelBody>
	);
};

const IconControls = ( { customIcon, currentColor, templateName, onIconChange } ) => (
	<PanelBody title={ __( 'Icon' ) }>
		<IconPicker
			customIcon={ customIcon }
			currentColor={ currentColor }
			onIconChange={ onIconChange }
			templateName={ templateName }
		/>
	</PanelBody>
);

const ColorControls = ( { customColor, onColorChange } ) => (
	<PanelBody title={ __( 'Color' ) }>
		<ColorPalette
			label={ __( 'Color' ) }
			value={ customColor }
			onChange={ onColorChange }
			colors={ CALLOUT_PANEL_COLORS }
			disableCustomColors={ false }
			clearable={ false }
		/>
	</PanelBody>
);

const CalloutBlock = ( { templateName, customStyle, customIcon } ) => {
	const getCalloutBlockStructure = ( template, icon = '' ) => {
		return [
			[
				'core/paragraph',
				{
					content: `<span class="dashicons ${ getIcon(
						template,
						icon
					) }" aria-hidden="true"></span>`,
					placeholder: ' ',
					className: 'o2-blocks-callout__icon',
					lock: {
						move: true,
						remove: true,
					},
				},
			],
			[
				'core/paragraph',
				{
					placeholder: __( 'Header' ),
					className: 'o2-blocks-callout__header',
					lock: {
						move: true,
						remove: true,
					},
				},
			],
			[
				'core/paragraph',
				{
					placeholder: __( 'Enter details here…' ),
				},
			],
		];
	};

	return (
		<div
			className={ `o2-blocks-callout o2-blocks-callout--${ templateName }` }
			style={ customStyle }
		>
			<InnerBlocks
				allowedBlocks={ null } // Allow all blocks
				template={ getCalloutBlockStructure( templateName, customIcon ) }
			/>
		</div>
	);
};

// === MAIN EDIT AND SAVE FUNCTIONS ===

const Edit = ( { attributes, setAttributes, clientId } ) => {
	const { templateName, customColor, customIcon } = useCalloutAttributes( attributes );
	const { currentColor, customStyle } = useCalloutStyles( templateName, customColor );
	const { innerBlocks, updateBlockAttributes } = useBlockEditor( clientId );

	const updateIconBlock = useCallback(
		( newTemplate, newCustomIcon = '' ) => {
			const iconBlock = innerBlocks?.find(
				( block ) => block.attributes?.className === 'o2-blocks-callout__icon'
			);

			if ( iconBlock ) {
				const newIcon = getIcon( newTemplate, newCustomIcon );
				const expectedContent = `<span class="dashicons ${ newIcon }" aria-hidden="true"></span>`;

				// Only update if content actually changed
				if ( iconBlock.attributes.content !== expectedContent ) {
					updateBlockAttributes( iconBlock.clientId, {
						content: expectedContent,
						placeholder: ' ',
					} );
				}
			}
		},
		[ innerBlocks, updateBlockAttributes ]
	);

	const handlers = {
		template: useTemplateHandler( templateName, customIcon, setAttributes, updateIconBlock ),
		color: useColorHandler( customColor, setAttributes ),
		icon: useIconHandler( customIcon, templateName, setAttributes, updateIconBlock ),
	};

	return (
		<>
			<InspectorControls>
				{ /* Template Controls */ }
				<TemplateControls templateName={ templateName } onChange={ handlers.template } />

				{ /* Custom Controls */ }
				{ templateName === 'custom' && (
					<>
						<ColorControls customColor={ customColor } onColorChange={ handlers.color } />
						<IconControls
							customIcon={ customIcon }
							currentColor={ currentColor }
							templateName={ templateName }
							onIconChange={ handlers.icon }
						/>
					</>
				) }
			</InspectorControls>

			<CalloutBlock
				templateName={ templateName }
				customStyle={ customStyle }
				customIcon={ customIcon }
			/>
		</>
	);
};

const save = ( { attributes } ) => {
	const { calloutTemplate: templateName = 'custom', customColor } = attributes;
	const customStyle =
		templateName === 'custom'
			? { '--custom-color': normalizeColor( customColor ) || CALLOUT_TEMPLATE_DEFAULT_COLOR }
			: {};

	return (
		<div
			className={ `o2-blocks-callout o2-blocks-callout--${ templateName }` }
			style={ customStyle }
		>
			<InnerBlocks.Content />
		</div>
	);
};

registerBlockType( 'a8c/callout', {
	title: __( 'Callout' ),
	icon: 'megaphone',
	category: 'a8c',
	description: __( 'Create a styled callout box with icon, header, and content sections.' ),
	keywords: [
		__( 'callout' ),
		__( 'example' ),
		__( 'warning' ),
		__( 'tip' ),
		__( 'info' ),
		__( 'notice' ),
	],
	supports: {
		html: false,
		className: false,
	},
	attributes: {
		calloutTemplate: {
			type: 'string',
			default: 'custom',
		},
		customColor: {
			type: 'string',
			default: CALLOUT_TEMPLATE_DEFAULT_COLOR,
		},
		customIcon: {
			type: 'string',
			default: '',
		},
	},
	edit: Edit,
	save,
	transforms,
} );
