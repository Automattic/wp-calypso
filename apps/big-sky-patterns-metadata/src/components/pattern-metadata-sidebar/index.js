/**
 * WordPress dependencies
 */
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { usePatternMetadata } from '../../hooks/use-pattern-metadata';
import './style.scss';

/**
 * Pattern Metadata Sidebar Component
 */
export default function PatternMetadataSidebar() {
	const {
		patternMetadata,
		setAlignment,
		setTextDensity,
		setMediaDensity,
		setPreferredNextAlignment,
		setPreferredNextTextDensity,
		setPreferredNextMediaDensity,
	} = usePatternMetadata();

	if ( ! patternMetadata ) {
		return null;
	}

	const alignmentOptions = [
		{ label: __( 'Default', 'pattern-metadata-sidebar' ), value: 'default' },
		{
			label: __( 'Pull Left', 'pattern-metadata-sidebar' ),
			value: 'pull-left',
		},
		{
			label: __( 'Pull Right', 'pattern-metadata-sidebar' ),
			value: 'pull-right',
		},
		{
			label: __( 'Centered', 'pattern-metadata-sidebar' ),
			value: 'centered',
		},
		{
			label: __( 'Full Width', 'pattern-metadata-sidebar' ),
			value: 'full-width',
		},
	];

	const densityOptions = [
		{ label: __( 'Default', 'pattern-metadata-sidebar' ), value: 'default' },
		{ label: __( 'Light', 'pattern-metadata-sidebar' ), value: 'light' },
		{ label: __( 'Medium', 'pattern-metadata-sidebar' ), value: 'medium' },
		{ label: __( 'Heavy', 'pattern-metadata-sidebar' ), value: 'heavy' },
	];

	return (
		<div className="pattern-metadata-sidebar">
			<div className="pattern-metadata-sidebar__description">
				<p>
					{ __(
						'Configure metadata for patterns to guide intelligent pattern selection and layout decisions.',
						'pattern-metadata-sidebar'
					) }
				</p>
			</div>

			<PanelBody
				title={ __( 'Current Pattern Attributes', 'pattern-metadata-sidebar' ) }
				initialOpen
			>
				<SelectControl
					label={ __( 'Alignment', 'pattern-metadata-sidebar' ) }
					value={ patternMetadata.alignment }
					options={ alignmentOptions }
					onChange={ setAlignment }
				/>

				<SelectControl
					label={ __( 'Text Density', 'pattern-metadata-sidebar' ) }
					value={ patternMetadata.textDensity }
					options={ densityOptions }
					onChange={ setTextDensity }
				/>

				<SelectControl
					label={ __( 'Media Density', 'pattern-metadata-sidebar' ) }
					value={ patternMetadata.mediaDensity }
					options={ densityOptions }
					onChange={ setMediaDensity }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Preferred Next Pattern Attributes', 'pattern-metadata-sidebar' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'Preferred Next Alignment', 'pattern-metadata-sidebar' ) }
					value={ patternMetadata.preferredNextAlignment }
					options={ alignmentOptions }
					onChange={ setPreferredNextAlignment }
				/>

				<SelectControl
					label={ __( 'Preferred Next Text Density', 'pattern-metadata-sidebar' ) }
					value={ patternMetadata.preferredNextTextDensity }
					options={ densityOptions }
					onChange={ setPreferredNextTextDensity }
				/>

				<SelectControl
					label={ __( 'Preferred Next Media Density', 'pattern-metadata-sidebar' ) }
					value={ patternMetadata.preferredNextMediaDensity }
					options={ densityOptions }
					onChange={ setPreferredNextMediaDensity }
				/>
			</PanelBody>
		</div>
	);
}
