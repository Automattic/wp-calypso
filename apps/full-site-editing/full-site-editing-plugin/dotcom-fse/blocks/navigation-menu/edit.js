/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * WordPress dependencies
 */
import ServerSideRender from '@wordpress/server-side-render';
import { Fragment } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import {
	AlignmentToolbar,
	BlockControls,
	ContrastChecker,
	FontSizePicker,
	InspectorControls,
	PanelColorSettings,
	withColors,
	withFontSizes,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */

const NavigationMenuEdit = ( {
	attributes,
	backgroundColor,
	fontSize,
	setAttributes,
	setBackgroundColor,
	setFontSize,
	setTextColor,
	textColor,
	isPublished,
} ) => {
	const { customFontSize, textAlign } = attributes;

	const actualFontSize = customFontSize || fontSize.size;

	return (
		<Fragment>
			<BlockControls>
				<AlignmentToolbar
					value={ textAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody className="blocks-font-size" title={ __( 'Text Settings' ) }>
					<FontSizePicker onChange={ setFontSize } value={ actualFontSize } />
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Color Settings' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: backgroundColor.color,
							onChange: setBackgroundColor,
							label: __( 'Background Color' ),
						},
						{
							value: textColor.color,
							onChange: setTextColor,
							label: __( 'Text Color' ),
						},
					] }
				>
					<ContrastChecker
						{ ...{
							textColor: textColor.color,
							backgroundColor: backgroundColor.color,
						} }
						fontSize={ actualFontSize }
					/>
				</PanelColorSettings>
			</InspectorControls>
			<ServerSideRender
				isPublished={ isPublished }
				block="a8c/navigation-menu"
				attributes={ attributes }
			/>
		</Fragment>
	);
};

export default compose( [
	withColors( 'backgroundColor', { textColor: 'color' } ),
	withFontSizes( 'fontSize' ),
	withSelect( ( select ) => {
		return {
			isPublished: select( 'core/editor' ).isCurrentPostPublished(),
		};
	} ),
] )( NavigationMenuEdit );
