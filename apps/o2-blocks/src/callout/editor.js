/**
 * Callout Block - Simplified Single Block Implementation
 *
 * A styled callout box with integrated icon, header, and content sections.
 */

import { RichText, InnerBlocks, InspectorControls, ColorPalette } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { CustomSelectControl, PanelBody, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import {
	CALLOUT_TEMPLATE_DEFAULT_COLOR,
	CALLOUT_TEMPLATES,
	CALLOUT_PANEL_COLORS,
	CALLOUT_PANEL_DASHICONS,
} from './constants';
import { transforms } from './transform';

import './editor.scss';
import './view.scss';

// === UTILITY FUNCTIONS ===

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

// === COMPONENTS ===

const CalloutIcon = ( { iconName, color } ) => (
	<div className="o2-blocks-callout__icon" style={ { borderColor: color } }>
		<span className={ `dashicons ${ iconName }` } style={ { color } } aria-hidden="true" />
	</div>
);

const CalloutHeader = ( { content, onChange, placeholder, color, iconName } ) => (
	<h2 className="o2-blocks-callout__header" style={ { color } }>
		<CalloutIcon iconName={ iconName } color={ color } />
		<span className="o2-blocks-callout__header-text">
			<RichText
				value={ content }
				onChange={ onChange }
				placeholder={ placeholder }
				allowedFormats={ [ 'core/bold', 'core/italic' ] }
				style={ { color } }
			/>
		</span>
	</h2>
);

const IconPicker = ( { customIcon, currentColor, onIconChange, templateName } ) => {
	const currentIconName = getIcon( templateName, customIcon );

	return (
		<div className="o2-blocks-callout__icon-picker">
			<div className="o2-blocks-callout__icon-picker-grid">
				{ CALLOUT_PANEL_DASHICONS.map( ( iconName ) => {
					const isSelected = currentIconName === iconName;

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
							<span
								className={ `dashicons ${ iconName }` }
								style={ { color: currentColor } }
								aria-hidden="true"
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
	const templateOptions = useMemo(
		() =>
			Object.entries( CALLOUT_TEMPLATES ).map( ( [ key, value ] ) => ( {
				key,
				name: value.name,
			} ) ),
		[]
	);

	const selectedTemplate = useMemo(
		() =>
			templateOptions.find( ( option ) => option.key === templateName ) || {
				key: 'custom',
				name: CALLOUT_TEMPLATES.custom.name,
			},
		[ templateOptions, templateName ]
	);

	return (
		<PanelBody title={ __( 'Templates' ) }>
			<CustomSelectControl
				options={ templateOptions }
				value={ selectedTemplate }
				onChange={ onChange }
			/>
		</PanelBody>
	);
};

const ColorControls = ( { customColor, onColorChange } ) => (
	<PanelBody title={ __( 'Color' ) }>
		<ColorPalette
			colors={ CALLOUT_PANEL_COLORS }
			value={ customColor }
			onChange={ onColorChange }
		/>
	</PanelBody>
);

const IconControls = ( { customIcon, currentColor, templateName, onIconChange } ) => (
	<PanelBody title={ __( 'Icon' ) }>
		<IconPicker
			customIcon={ customIcon }
			currentColor={ currentColor }
			templateName={ templateName }
			onIconChange={ onIconChange }
		/>
	</PanelBody>
);

// === MAIN COMPONENT ===

const Edit = ( { attributes, setAttributes } ) => {
	const {
		calloutTemplate: templateName = 'custom',
		customColor = CALLOUT_TEMPLATE_DEFAULT_COLOR,
		customIcon = '',
		headerContent = '',
	} = attributes;

	const currentColor = getCurrentColor( templateName, customColor );
	const currentIcon = getIcon( templateName, customIcon );

	const customStyle =
		templateName === 'custom'
			? { '--custom-color': normalizeColor( customColor ) || CALLOUT_TEMPLATE_DEFAULT_COLOR }
			: {};

	const handleTemplateChange = useCallback(
		( { selectedItem } ) => {
			if ( selectedItem?.key && selectedItem.key !== templateName ) {
				const newAttributes = { calloutTemplate: selectedItem.key };

				// Clear custom icon when switching to a template type (non-custom)
				if ( selectedItem.key !== 'custom' && customIcon ) {
					newAttributes.customIcon = '';
				}

				setAttributes( newAttributes );
			}
		},
		[ templateName, customIcon, setAttributes ]
	);

	const handleColorChange = useCallback(
		( color ) => {
			const normalizedColor = normalizeColor( color );
			if ( normalizedColor !== customColor ) {
				setAttributes( { customColor: normalizedColor } );
			}
		},
		[ customColor, setAttributes ]
	);

	const handleIconChange = useCallback(
		( iconName ) => {
			if ( iconName !== customIcon ) {
				setAttributes( { customIcon: iconName } );
			}
		},
		[ customIcon, setAttributes ]
	);

	const handleHeaderChange = useCallback(
		( newHeaderContent ) => {
			setAttributes( { headerContent: newHeaderContent } );
		},
		[ setAttributes ]
	);

	return (
		<>
			<InspectorControls>
				<TemplateControls templateName={ templateName } onChange={ handleTemplateChange } />
				{ templateName === 'custom' && (
					<ColorControls customColor={ customColor } onColorChange={ handleColorChange } />
				) }
				<IconControls
					customIcon={ customIcon }
					currentColor={ currentColor }
					templateName={ templateName }
					onIconChange={ handleIconChange }
				/>
			</InspectorControls>

			<aside
				className={ `o2-blocks-callout o2-blocks-callout--${ templateName }` }
				style={ customStyle }
			>
				<CalloutHeader
					content={ headerContent }
					onChange={ handleHeaderChange }
					placeholder={ __( 'Header' ) }
					color={ currentColor }
					iconName={ currentIcon }
				/>

				<InnerBlocks
					template={ [ [ 'core/paragraph', {} ] ] }
					templateInsertUpdatesSelection={ false }
				/>
			</aside>
		</>
	);
};

const Save = ( { attributes } ) => {
	const {
		calloutTemplate: templateName = 'custom',
		customColor = CALLOUT_TEMPLATE_DEFAULT_COLOR,
		customIcon = '',
		headerContent = '',
	} = attributes;

	const currentColor = getCurrentColor( templateName, customColor );
	const currentIcon = getIcon( templateName, customIcon );

	const customStyle =
		templateName === 'custom'
			? { '--custom-color': normalizeColor( customColor ) || CALLOUT_TEMPLATE_DEFAULT_COLOR }
			: {};

	return (
		<aside
			className={ `o2-blocks-callout o2-blocks-callout--${ templateName }` }
			style={ customStyle }
		>
			<h2 className="o2-blocks-callout__header" style={ { color: currentColor } }>
				<CalloutIcon iconName={ currentIcon } color={ currentColor } />
				<span className="o2-blocks-callout__header-text">
					<RichText.Content value={ headerContent } style={ { color: currentColor } } />
				</span>
			</h2>

			<InnerBlocks.Content />
		</aside>
	);
};

// === BLOCK REGISTRATION ===

registerBlockType( 'a8c/callout', {
	title: __( 'Callout' ),
	description: __( 'Draw attention with a styled callout box.' ),
	icon: 'megaphone',
	category: 'a8c',
	keywords: [ __( 'callout' ), __( 'info' ), __( 'warning' ), __( 'tip' ) ],
	supports: {
		align: [ 'wide', 'full' ],
		html: false,
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
		headerContent: {
			type: 'string',
			source: 'html',
			selector: '.o2-blocks-callout__header-text',
			default: '',
		},
	},
	transforms,
	edit: Edit,
	save: Save,
} );
