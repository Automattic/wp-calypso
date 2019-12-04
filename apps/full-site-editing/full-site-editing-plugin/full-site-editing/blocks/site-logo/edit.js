/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEntityProp, __experimentalUseEntitySaving } from '@wordpress/core-data';
import { IconButton, PanelBody, RangeControl, Toolbar } from '@wordpress/components';
import {
	BlockControls,
	BlockAlignmentToolbar,
	BlockIcon,
	InspectorControls,
	MediaPlaceholder,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import icon from './icon';

const onError = message => {
	console.log( message );
};

export default function LogoEdit( {
	attributes: { align, width },
	children,
	className,
	setAttributes,
} ) {
	const [ isEditing, setIsEditing ] = useState( false );
	const [ logo, setLogo ] = useEntityProp( 'root', 'site', 'sitelogo' );
	const [ isDirty, , save ] = __experimentalUseEntitySaving( 'root', 'site', 'sitelogo' );

	const mediaItemData = useSelect(
		select => {
			const mediaItem = select( 'core' ).getEntityRecord( 'root', 'media', logo );
			return (
				mediaItem && {
					url: mediaItem.source_url,
					alt: mediaItem.alt_text,
				}
			);
		},
		[ logo ]
	);

	let url = null;
	let alt = null;
	if ( mediaItemData ) {
		alt = mediaItemData.alt;
		url = mediaItemData.url;
	}

	if ( isDirty ) {
		save();
	}

	const toggleIsEditing = () => setIsEditing( ! isEditing );

	const setIsNotEditing = () => setIsEditing( false );

	const onSelectLogo = media => {
		if ( ! media || ! media.id ) {
			return;
		}

		setLogo( media.id.toString() );
		setIsNotEditing();
	};

	const deleteLogo = () => {
		setLogo( '' );
	};

	const controls = (
		<>
			<BlockControls>
				<BlockAlignmentToolbar
					value={ align }
					onChange={ newAlign => setAttributes( { align: newAlign } ) }
					controls={ [ 'left', 'center', 'right' ] }
				/>
				{ !! url && (
					<Toolbar>
						<IconButton
							className={ classnames( 'components-icon-button components-toolbar__control', {
								'is-active': isEditing,
							} ) }
							label={ __( 'Edit image' ) }
							aria-pressed={ isEditing }
							onClick={ toggleIsEditing }
							icon="edit"
						/>
					</Toolbar>
				) }
			</BlockControls>
			{ isEditing ? null : (
				<InspectorControls>
					<PanelBody title={ __( 'Site Logo Settings' ) }>
						<RangeControl
							label={ __( 'Image width (%)' ) }
							onChange={ newWidth => setAttributes( { width: newWidth } ) }
							min={ 1 }
							max={ 100 }
							value={ width ? width : 100 }
						/>
					</PanelBody>
				</InspectorControls>
			) }
		</>
	);

	const label = __( 'Site Logo' );
	const logoImage = (
		<a href="#home" className="custom-logo-link" rel="home">
			<img className="custom-logo" src={ url } alt={ alt } width={ width + '%' } align={ align } />
		</a>
	);
	const editComponent = (
		<MediaPlaceholder
			icon={ <BlockIcon icon={ icon } fill="ff0000" /> }
			labels={ {
				title: label,
				instructions: __(
					'Upload an image, or pick one from your media library, to be your site logo'
				),
			} }
			onSelect={ onSelectLogo }
			accept="image/*"
			allowedTypes={ [ 'image' ] }
			mediaPreview={ !! url && logoImage }
			onCancel={ !! url && setIsNotEditing }
			onError={ onError }
		>
			{ !! url && (
				<IconButton isLarge icon="delete" onClick={ deleteLogo }>
					{ __( 'Delete Site Logo' ) }
				</IconButton>
			) }
			{ children }
		</MediaPlaceholder>
	);

	return (
		<>
			<div className={ className }>
				{ controls }
				{ ! url || isEditing ? editComponent : logoImage }
			</div>
		</>
	);
}
