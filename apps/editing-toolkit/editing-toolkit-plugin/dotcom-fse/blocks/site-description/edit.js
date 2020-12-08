/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	AlignmentToolbar,
	BlockControls,
	ContrastChecker,
	FontSizePicker,
	InspectorControls,
	PanelColorSettings,
	RichText,
	withColors,
	withFontSizes,
} from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { withSiteOptions } from '../../lib';

function SiteDescriptionEdit( {
	attributes,
	backgroundColor,
	className,
	fontSize,
	insertDefaultBlock,
	setAttributes,
	setBackgroundColor,
	setFontSize,
	setTextColor,
	siteDescription,
	textColor,
} ) {
	const { customFontSize, textAlign } = attributes;

	const actualFontSize = customFontSize || fontSize.size;

	const { value, updateValue } = siteDescription;

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
				<PanelBody
					className="blocks-font-size"
					title={ __( 'Text Settings', 'full-site-editing' ) }
				>
					<FontSizePicker onChange={ setFontSize } value={ actualFontSize } />
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Color Settings', 'full-site-editing' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: backgroundColor.color,
							onChange: setBackgroundColor,
							label: __( 'Background Color', 'full-site-editing' ),
						},
						{
							value: textColor.color,
							onChange: setTextColor,
							label: __( 'Text Color', 'full-site-editing' ),
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
			<RichText
				allowedFormats={ [] }
				aria-label={ __( 'Site Description', 'full-site-editing' ) }
				className={ classNames( 'site-description', className, {
					'has-text-color': textColor.color,
					'has-background': backgroundColor.color,
					[ `has-text-align-${ textAlign }` ]: textAlign,
					[ backgroundColor.class ]: backgroundColor.class,
					[ textColor.class ]: textColor.class,
					[ fontSize.class ]: ! customFontSize && fontSize.class,
				} ) }
				identifier="content"
				onChange={ updateValue }
				onReplace={ insertDefaultBlock }
				onSplit={ noop }
				placeholder={ __( 'Add a Site Description', 'full-site-editing' ) }
				style={ {
					backgroundColor: backgroundColor.color,
					color: textColor.color,
					fontSize: actualFontSize ? actualFontSize + 'px' : undefined,
				} }
				tagName="p"
				value={ value }
			/>
		</Fragment>
	);
}

export default compose( [
	withColors( 'backgroundColor', { textColor: 'color' } ),
	withFontSizes( 'fontSize' ),
	withSelect( ( select, { clientId } ) => {
		const { getBlockIndex, getBlockRootClientId, getTemplateLock } = select( 'core/block-editor' );
		const rootClientId = getBlockRootClientId( clientId );

		return {
			blockIndex: getBlockIndex( clientId, rootClientId ),
			isLocked: !! getTemplateLock( rootClientId ),
			rootClientId,
		};
	} ),
	withDispatch( ( dispatch, { blockIndex, rootClientId } ) => ( {
		insertDefaultBlock: () =>
			dispatch( 'core/block-editor' ).insertDefaultBlock( {}, rootClientId, blockIndex + 1 ),
	} ) ),
	withSiteOptions( {
		siteDescription: {
			optionName: 'description',
			defaultValue: __( 'Site description loading…', 'full-site-editing' ),
		},
	} ),
] )( SiteDescriptionEdit );
