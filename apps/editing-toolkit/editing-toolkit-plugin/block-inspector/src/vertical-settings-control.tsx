import { InspectorControls } from '@wordpress/block-editor';
import { FormTokenField, PanelBody } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import './vertical-settings-control.scss';

interface SiteVerticalsTerm {
	ID: number;
	name: string;
	description: string;
}

declare global {
	interface Window {
		blockInspectorSiteVerticalsTerms?: SiteVerticalsTerm[];
	}
}

interface Settings {
	[ key: string ]: any;
}

const addAttribute = ( settings: Settings ) => {
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

const VerticalSettingsControl = ( {
	attributes: { verticalSettings },
	setAttributes,
}: Settings ) => {
	const { blockInspectorSiteVerticalsTerms: terms } = window;
	const suggestionIdToNameMap = useMemo(
		() =>
			terms.reduce(
				( acc, cur ) => ( {
					...acc,
					[ cur.ID ]: cur.name,
				} ),
				{}
			),
		[]
	);

	const suggestionNameToIdMap = useMemo(
		() =>
			terms.reduce(
				( acc, cur ) => ( {
					...acc,
					[ cur.name ]: cur.ID,
				} ),
				{}
			),
		[]
	);

	const value = useMemo(
		() => ( verticalSettings?.semanticTags || [] ).map( ( id ) => suggestionIdToNameMap[ id ] ),
		[ verticalSettings?.semanticTags ]
	);

	const handleChange = ( tokens ) => {
		setAttributes( {
			verticalSettings: {
				...verticalSettings,
				semanticTags: tokens.map( ( token ) => suggestionNameToIdMap[ token ] ),
			},
		} );
	};

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Vertical Settings', 'full-site-editing' ) }>
				<FormTokenField
					// @ts-expect-error: @types/wordpress__components doesn't align with latest @wordpress/components
					className="vertical-settings-control__form-token-field"
					label={ __( 'Add Semantic Tags', 'full-site-editing' ) }
					value={ value }
					suggestions={ Object.values( suggestionIdToNameMap ) }
					__experimentalExpandOnFocus
					__experimentalShowHowTo={ false }
					__experimentalValidateInput={ ( input ) => !! suggestionNameToIdMap[ input ] }
					onChange={ handleChange }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

interface ComponentProps {
	isSelected: boolean;
}

const withInspectorControl = createHigherOrderComponent< ComponentProps, any >( ( BlockEdit ) => {
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
