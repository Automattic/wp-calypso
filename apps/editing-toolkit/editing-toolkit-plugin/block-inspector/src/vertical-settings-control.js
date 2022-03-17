import { InspectorControls } from '@wordpress/block-editor';
import { FormTokenField, PanelBody } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const addAttribute = ( settings ) => {
	settings.attributes = {
		...settings.attributes,
		verticalSettings: {
			type: 'object',
			properties: {
				semanticTags: { type: 'array' },
			},
		},
	};

	return settings;
};

const VerticalSettingsControl = ( { attributes: { verticalSettings }, setAttributes } ) => {
	const handleChange = ( tokens ) => {
		setAttributes( { verticalSettings: { ...verticalSettings, semanticTags: tokens } } );
	};

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Vertical Settings', 'full-site-editing' ) }>
				<FormTokenField
					label={ __( 'Add Semantic Tags', 'full-site-editing' ) }
					value={ verticalSettings?.semanticTags || [] }
					onChange={ handleChange }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

const withInspectorControl = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( ! props.isSelected ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<BlockEdit { ...props } />
				<VerticalSettingsControl { ...props } />
			</>
		);
	};
}, 'withInspectorControl' );

addFilter(
	'blocks.registerBlockType',
	'full-site-editing/block-inspector/vertical-settings-control/attribute',
	addAttribute
);

addFilter(
	'editor.BlockEdit',
	'full-site-editing/block-inspector/vertical-settings-control/with-inspector-control',
	withInspectorControl
);
