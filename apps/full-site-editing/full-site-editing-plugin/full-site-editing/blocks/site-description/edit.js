/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import classNames from 'classnames';

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
	PlainText,
	RichText,
	withColors,
	withFontSizes,
} from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ENTER } from '@wordpress/keycodes';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';

function SiteDescriptionEdit( {
	attributes,
	backgroundColor,
	className,
	createErrorNotice,
	fontSize,
	insertDefaultBlock,
	isLocked,
	isSelected,
	setAttributes,
	setBackgroundColor,
	setFontSize,
	setTextColor,
	shouldUpdateSiteOption,
	textColor,
} ) {
	const { textAlign } = attributes;

	const inititalDescription = __( 'Site description loading…' );

	const { siteOptions, handleChange } = useSiteOptions(
		'description',
		inititalDescription,
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption,
		setAttributes
	);

	const { option } = siteOptions;

	const onKeyDown = event => {
		if ( event.keyCode !== ENTER ) {
			return;
		}
		event.preventDefault();
		if ( ! isLocked ) {
			insertDefaultBlock();
		}
	};

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
					<FontSizePicker onChange={ setFontSize } value={ fontSize.size } />
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
						fontSize={ fontSize.size }
					/>
				</PanelColorSettings>
			</InspectorControls>
			{ false && (
				<PlainText
					aria-label={ __( 'Site Description' ) }
					className={ classNames( 'site-description', className, {
						'has-text-color': textColor.color,
						'has-background': backgroundColor.color,
						[ `has-text-align-${ textAlign }` ]: textAlign,
						[ backgroundColor.class ]: backgroundColor.class,
						[ textColor.class ]: textColor.class,
						[ fontSize.class ]: fontSize.class,
					} ) }
					onChange={ value => handleChange( value ) }
					onKeyDown={ onKeyDown }
					placeholder={ __( 'Add a Site Description' ) }
					style={ {
						backgroundColor: backgroundColor.color,
						color: textColor.color,
						fontSize: fontSize.size ? fontSize.size + 'px' : undefined,
					} }
					value={ option }
				/>
			) }
			<RichText
				allowedFormats={ [] }
				aria-label={ __( 'Site Description' ) }
				className={ classNames( 'site-description', className, {
					'has-text-color': textColor.color,
					'has-background': backgroundColor.color,
					[ `has-text-align-${ textAlign }` ]: textAlign,
					[ backgroundColor.class ]: backgroundColor.class,
					[ textColor.class ]: textColor.class,
					[ fontSize.class ]: fontSize.class,
				} ) }
				identifier="content"
				onChange={ value => handleChange( value ) }
				placeholder={ __( 'Add a Site Description' ) }
				style={ {
					backgroundColor: backgroundColor.color,
					color: textColor.color,
					fontSize: fontSize.size ? fontSize.size + 'px' : undefined,
				} }
				tagName="p"
				value={ option }
			/>
		</Fragment>
	);
}

export default compose( [
	withColors( 'backgroundColor', { textColor: 'color' } ),
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
		insertDefaultBlock: () => {
			dispatch( 'core/block-editor' ).insertDefaultBlock( {}, rootClientId, blockIndex + 1 );
			dispatch( 'core/block-editor' ).selectNextBlock( rootClientId );
		},
	} ) ),
] )( SiteDescriptionEdit );
