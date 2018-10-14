/** @format */

/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import {
	SelectControl,
	IconButton,
	Toolbar,
	PanelBody,
	withNotices,
	RangeControl,
} from '@wordpress/components';

import {
	InspectorControls,
	BlockControls,
	MediaUpload,
	RichText,
	MediaPlaceholder,
	PanelColorSettings,
} from '@wordpress/editor';

import { Fragment } from '@wordpress/element';

/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * Internal dependencies
 */

import './style.scss';
import './editor.scss';

import { CONFIG } from './config.js';
import MultiBackground from 'gutenberg/extensions/shared/atavist/subcomponents/multi-background';
import BoundTitleText from 'gutenberg/extensions/shared/atavist/subcomponents/bound-title-text';
import FocalPointPicker from './focal-point-picker';

registerBlockType( CONFIG.name, {
	title: CONFIG.title,
	icon: CONFIG.icon,
	category: CONFIG.category,
	keywords: CONFIG.keywords,
	attributes: CONFIG.attributes,

	getEditWrapperProps() {
		return { 'data-align': 'full' };
	},

	edit: withNotices( ( { attributes, setAttributes, className, noticeOperations, noticeUI } ) => {
		const {
			id,
			url,
			dimensions,
			title,
			subtitle,
			byline,
			type,
			titlePosition,
			shimOpacityRatio,
			shimColor,
			focalPoint,
		} = attributes;

		const onSelectImage = media => {
			if ( ! media || ! media.url ) {
				setAttributes( {
					url: undefined,
					id: undefined,
					type: undefined,
					dimensions: undefined,
				} );
				return;
			}

			setAttributes( {
				url: media.url,
				id: media.id,
				type: media.type,
				dimensions: {
					height: media.height,
					width: media.width,
				},
			} );
		};

		const setShimOpacityRatio = ratio => setAttributes( { shimOpacityRatio: ratio } );

		const classes = classnames( className );

		const controls = (
			<Fragment>
				<BlockControls>
					<Toolbar>
						<MediaUpload
							onSelect={ onSelectImage }
							type="image,video"
							value={ id }
							render={ ( { open } ) => (
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Edit image' ) }
									icon="edit"
									onClick={ open }
								/>
							) }
						/>
					</Toolbar>
				</BlockControls>
			</Fragment>
		);

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Title Design Settings' ) }>
					<SelectControl
						label={ __( 'Title Position' ) }
						value={ titlePosition }
						onChange={ value => setAttributes( { titlePosition: value } ) }
						options={ CONFIG.titlePositionOptions }
					/>
					<PanelColorSettings
						title={ __( 'Overlay' ) }
						initialOpen={ true }
						colorSettings={ [
							{
								value: shimColor,
								onChange: value => setAttributes( { shimColor: value } ),
								label: __( 'Overlay Color' ),
							},
						] }
					>
						<RangeControl
							label={ __( 'Shim Opacity' ) }
							value={ shimOpacityRatio }
							onChange={ setShimOpacityRatio }
							min={ 0 }
							max={ 100 }
							step={ 1 }
						/>
					</PanelColorSettings>

					{ type === 'image' && (
						<PanelBody title={ __( 'Focal Point Picker' ) }>
							<FocalPointPicker
								url={ url }
								dimensions={ dimensions }
								focalPoint={ focalPoint }
								setFocalPoint={ value => setAttributes( { focalPoint: value } ) }
							/>
						</PanelBody>
					) }
				</PanelBody>
			</InspectorControls>
		);

		if ( ! url ) {
			const hasTitle = ! title;

			const icon = hasTitle ? undefined : 'format-image';

			const label = hasTitle ? (
				<RichText
					tagName="h2"
					value={ title }
					onChange={ value => setAttributes( { title: value } ) }
					inlineToolbar
				/>
			) : (
				__( 'Cover Image' )
			);

			return (
				<Fragment>
					{ controls }
					{ inspectorControls }
					<MediaPlaceholder
						icon={ icon }
						labels={ {
							title: label,
							name: __( 'an image' ),
						} }
						onSelect={ onSelectImage }
						accept="image/*"
						type="image"
						notices={ noticeUI }
						onError={ noticeOperations.createErrorNotice }
					/>
				</Fragment>
			);
		}
		return (
			<Fragment>
				{ controls }
				{ inspectorControls }
				<div className={ classes }>
					<MultiBackground
						shimColor={ shimColor }
						shimOpacity={ shimOpacityRatio }
						mediaURL={ url }
						mediaType={ type }
						focalPoint={ focalPoint }
					/>
					<div
						class="cover-text-outside-wrapper atavist-cover-left-gutter-padding-left atavist-cover-right-gutter-padding-right"
						data-cover-text-alignment={ titlePosition }
					>
						<div class="cover-text-inside-wrapper">
							<BoundTitleText
								tagName="h1"
								className="cover-title atavist-cover-font-sans-serif atavist-cover-h1"
								value={ title }
								placeholder="Type a title..."
								onChange={ value => setAttributes( { title: value } ) }
							/>
							<RichText
								tagName="h2"
								className="cover-subtitle atavist-cover-font-sans-serif atavist-cover-h2"
								value={ subtitle }
								placeholder="Type a subtitle..."
								onChange={ value => setAttributes( { subtitle: value } ) }
							/>
							<RichText
								tagName="div"
								className="cover-byline atavist-cover-font-sans-serif atavist-cover-byline"
								value={ byline }
								placeholder="Type a byline..."
								onChange={ value => setAttributes( { byline: value } ) }
							/>
						</div>
					</div>
				</div>
			</Fragment>
		);
	} ),

	save: function( { attributes, className } ) {
		const {
			url,
			type,
			title,
			subtitle,
			byline,
			titlePosition,
			shimOpacityRatio,
			shimColor,
			focalPoint,
		} = attributes;

		const classes = classnames( className );

		return (
			<div data-atavist_title_design="1" className={ classes }>
				<MultiBackground
					shimColor={ shimColor }
					shimOpacity={ shimOpacityRatio }
					mediaType={ type }
					mediaURL={ url }
					focalPoint={ focalPoint }
				/>
				<div
					class="cover-text-outside-wrapper atavist-cover-left-gutter-padding-left atavist-cover-right-gutter-padding-right"
					data-cover-text-alignment={ titlePosition }
				>
					<div class="cover-text-inside-wrapper">
						<h1 class="cover-title atavist-cover-font-sans-serif atavist-cover-h1">{ title }</h1>
						<h2 class="cover-subtitle atavist-cover-font-sans-serif atavist-cover-h2">
							{ subtitle }
						</h2>
						<div class="cover-byline atavist-cover-font-sans-serif atavist-cover-byline">
							{ byline }
						</div>
					</div>
				</div>
			</div>
		);
	},
} );
