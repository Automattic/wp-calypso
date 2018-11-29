/** @format */

/**
 * External Dependencies
 */
import { filter, pick } from 'lodash';
import { Component, Fragment } from '@wordpress/element';
import {
	DropZone,
	FormFileUpload,
	IconButton,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	Toolbar,
	withNotices,
} from '@wordpress/components';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	mediaUpload,
	MediaUpload,
} from '@wordpress/editor';
import { create } from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { ALLOWED_MEDIA_TYPES, MAX_COLUMNS, DEFAULT_COLUMNS } from './constants';
import GalleryGrid from './gallery-grid';
import GalleryImage from './gallery-image';
import { getActiveStyleName } from './layouts';

export function defaultColumnsNumber( attributes ) {
	return Math.min( DEFAULT_COLUMNS, attributes.images.length );
}

const pickRelevantMediaFiles = image => {
	let { caption } = image;

	if ( typeof caption !== 'object' ) {
		caption = create( { html: caption } );
	}

	return {
		...pick( image, [ 'alt', 'id', 'link', 'url' ] ),
		caption,
	};
};

class TiledGalleryEdit extends Component {
	constructor() {
		super( ...arguments );

		this.onSelectImage = this.onSelectImage.bind( this );
		this.onSelectImages = this.onSelectImages.bind( this );
		this.setLayout = this.setLayout.bind( this );
		this.setLinkTo = this.setLinkTo.bind( this );
		this.setColumnsNumber = this.setColumnsNumber.bind( this );
		this.toggleImageCrop = this.toggleImageCrop.bind( this );
		this.onRemoveImage = this.onRemoveImage.bind( this );
		this.setImageAttributes = this.setImageAttributes.bind( this );
		this.addFiles = this.addFiles.bind( this );
		this.uploadFromFiles = this.uploadFromFiles.bind( this );

		this.state = {
			selectedImage: null,
			layout: getActiveStyleName( arguments[ 0 ].className ),
		};
	}

	onSelectImage( index ) {
		return () => {
			if ( this.state.selectedImage !== index ) {
				this.setState( {
					selectedImage: index,
				} );
			}
		};
	}

	onRemoveImage( index ) {
		return () => {
			const images = filter( this.props.attributes.images, ( img, i ) => index !== i );
			const { columns } = this.props.attributes;
			this.setState( { selectedImage: null } );
			this.props.setAttributes( {
				images,
				columns: columns ? Math.min( images.length, columns ) : columns,
			} );
		};
	}

	onSelectImages( images ) {
		this.props.setAttributes( {
			images: images.map( image => pickRelevantMediaFiles( image ) ),
		} );
	}

	setLayout( layout ) {
		this.setState( { layout } );
	}

	setLinkTo( linkTo ) {
		this.props.setAttributes( { linkTo } );
	}

	setColumnsNumber( columns ) {
		this.props.setAttributes( { columns } );
	}

	toggleImageCrop() {
		this.props.setAttributes( { imageCrop: ! this.props.attributes.imageCrop } );
	}

	getImageCropHelp( checked ) {
		return checked ? __( 'Thumbnails are cropped to align.' ) : __( 'Thumbnails are not cropped.' );
	}

	setImageAttributes( index, attributes ) {
		const {
			attributes: { images },
			setAttributes,
		} = this.props;
		if ( ! images[ index ] ) {
			return;
		}
		setAttributes( {
			images: [
				...images.slice( 0, index ),
				{
					...images[ index ],
					...attributes,
				},
				...images.slice( index + 1 ),
			],
		} );
	}

	uploadFromFiles( event ) {
		this.addFiles( event.target.files );
	}

	addFiles( files ) {
		const currentImages = this.props.attributes.images || [];
		const { noticeOperations, setAttributes } = this.props;
		mediaUpload( {
			allowedTypes: ALLOWED_MEDIA_TYPES,
			filesList: files,
			onFileChange: images => {
				const imagesNormalized = images.map( image => pickRelevantMediaFiles( image ) );
				setAttributes( {
					images: currentImages.concat( imagesNormalized ),
				} );
			},
			onError: noticeOperations.createErrorNotice,
		} );
	}

	componentDidUpdate( prevProps ) {
		// Deselect images when deselecting the block
		if ( ! this.props.isSelected && prevProps.isSelected ) {
			//eslint-disable-next-line
			this.setState( {
				selectedImage: null,
				captionSelected: false,
			} );
		}

		if ( this.props.className !== prevProps.className ) {
			const activeStyleName = getActiveStyleName( this.props.className );

			if ( activeStyleName !== this.state.layout ) {
				this.setLayout( activeStyleName );
			}
		}
	}

	render() {
		const { selectedImage } = this.state;

		const { attributes, isSelected, className, noticeOperations, noticeUI } = this.props;

		const {
			images,
			columns = defaultColumnsNumber( attributes ),
			align,
			imageCrop,
			linkTo,
		} = attributes;

		const layoutsSupportingColumns = [ 'square', 'circle' ];

		const dropZone = <DropZone onFilesDrop={ this.addFiles } />;

		const controls = (
			<BlockControls>
				{ !! images.length && (
					<Toolbar>
						<MediaUpload
							onSelect={ this.onSelectImages }
							allowedTypes={ ALLOWED_MEDIA_TYPES }
							multiple
							gallery
							value={ images.map( img => img.id ) }
							render={ ( { open } ) => (
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Edit Gallery' ) }
									icon="edit"
									onClick={ open }
								/>
							) }
						/>
					</Toolbar>
				) }
			</BlockControls>
		);

		if ( images.length === 0 ) {
			return (
				<Fragment>
					{ controls }
					<MediaPlaceholder
						icon="format-gallery"
						className={ className }
						labels={ {
							title: __( 'Tiled gallery' ),
							name: __( 'images' ),
						} }
						onSelect={ this.onSelectImages }
						accept="image/*"
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						multiple
						notices={ noticeUI }
						onError={ noticeOperations.createErrorNotice }
					/>
				</Fragment>
			);
		}

		const renderGalleryImage = index => {
			if ( ! images[ index ] ) {
				return null;
			}

			const image = images[ index ];

			return (
				<GalleryImage
					alt={ image.alt }
					caption={ image.caption }
					id={ image.id }
					isSelected={ isSelected && selectedImage === index }
					onRemove={ this.onRemoveImage( index ) }
					onSelect={ this.onSelectImage( index ) }
					setAttributes={ attrs => this.setImageAttributes( index, attrs ) }
					url={ image.url }
				/>
			);
		};

		return (
			<Fragment>
				{ controls }
				<InspectorControls>
					<PanelBody title={ __( 'Tiled gallery settings' ) }>
						{ images.length > 1 && (
							<RangeControl
								label={ __( 'Columns' ) }
								value={ columns }
								onChange={ this.setColumnsNumber }
								min={ 1 }
								disabled={ layoutsSupportingColumns.indexOf( this.state.layout ) === -1 }
								max={ Math.min( MAX_COLUMNS, images.length ) }
							/>
						) }
						<ToggleControl
							label={ __( 'Crop images' ) }
							checked={ !! imageCrop }
							onChange={ this.toggleImageCrop }
							help={ this.getImageCropHelp }
						/>
						<SelectControl
							label={ __( 'Link to' ) }
							value={ linkTo }
							onChange={ this.setLinkTo }
							options={ [
								{ value: 'attachment', label: __( 'Attachment page' ) },
								{ value: 'media', label: __( 'Media file' ) },
								{ value: 'none', label: __( 'None' ) },
							] }
						/>
					</PanelBody>
				</InspectorControls>
				{ noticeUI }
				{ dropZone }
				<GalleryGrid
					align={ align }
					className={ className }
					columns={ columns }
					imageCrop={ imageCrop }
					images={ images }
					layout={ this.state.layout }
					renderGalleryImage={ renderGalleryImage }
				>
					{ isSelected && (
						<FormFileUpload
							multiple
							isLarge
							className="block-library-gallery-add-item-button"
							onChange={ this.uploadFromFiles }
							accept="image/*"
							icon="insert"
						>
							{ __( 'Upload an image' ) }
						</FormFileUpload>
					) }
				</GalleryGrid>
			</Fragment>
		);
	}
}

export default withNotices( TiledGalleryEdit );
