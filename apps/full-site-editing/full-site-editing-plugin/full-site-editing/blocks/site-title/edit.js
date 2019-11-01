/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	AlignmentToolbar,
	BlockControls,
	FontSizePicker,
	InspectorControls,
	PanelColorSettings,
	RichText,
	withColors,
	withFontSizes,
} from '@wordpress/block-editor';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useSiteOptions } from '../../lib';

function SiteTitleEdit( {
	attributes,
	className,
	createErrorNotice,
	fontSize,
	insertDefaultBlock,
	isSelected,
	setAttributes,
	setFontSize,
	setTextColor,
	shouldUpdateSiteOption,
	textColor,
} ) {
	const { customFontSize, textAlign } = attributes;

	const actualFontSize = customFontSize || fontSize.size;

	const inititalTitle = __( 'Site title loading…' );

	const { siteOptions, handleChange } = useSiteOptions(
		'title',
		inititalTitle,
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption,
		setAttributes
	);

	const { option } = siteOptions;

	return (
		<Fragment>
			<BlockControls>
				<AlignmentToolbar
					value={ textAlign }
					onChange={ nextAlign => {
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
							value: textColor.color,
							onChange: setTextColor,
							label: __( 'Text Color' ),
						},
					] }
				/>
			</InspectorControls>
			<RichText
				allowedFormats={ [] }
				aria-label={ __( 'Site Title' ) }
				className={ classNames( 'site-title', className, {
					'has-text-color': textColor.color,
					[ `has-text-align-${ textAlign }` ]: textAlign,
					[ textColor.class ]: textColor.class,
					[ fontSize.class ]: ! customFontSize && fontSize.class,
				} ) }
				identifier="content"
				onChange={ value => handleChange( value ) }
				onReplace={ insertDefaultBlock }
				onSplit={ noop }
				placeholder={ __( 'Add a Site Title' ) }
				style={ {
					color: textColor.color,
					fontSize: actualFontSize ? actualFontSize + 'px' : undefined,
				} }
				tagName="h1"
				value={ option }
			/>
		</Fragment>
	);
}

export default compose( [
	withColors( { textColor: 'color' } ),
	withFontSizes( 'fontSize' ),
	withSelect( ( select, { clientId } ) => {
		const { isSavingPost, isPublishingPost, isAutosavingPost, isCurrentPostPublished } = select(
			'core/editor'
		);
		const { getBlockIndex, getBlockRootClientId, getTemplateLock } = select( 'core/block-editor' );
		const rootClientId = getBlockRootClientId( clientId );

		return {
			blockIndex: getBlockIndex( clientId, rootClientId ),
			isLocked: !! getTemplateLock( rootClientId ),
			rootClientId,
			shouldUpdateSiteOption:
				( ( isSavingPost() && isCurrentPostPublished() ) || isPublishingPost() ) &&
				! isAutosavingPost(),
		};
	} ),
	withDispatch( ( dispatch, { blockIndex, rootClientId } ) => ( {
		createErrorNotice: dispatch( 'core/notices' ).createErrorNotice,
		insertDefaultBlock: () =>
			dispatch( 'core/block-editor' ).insertDefaultBlock( {}, rootClientId, blockIndex + 1 ),
	} ) ),
] )( SiteTitleEdit );
