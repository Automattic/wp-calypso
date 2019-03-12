/**
 * External Dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { filter, get, pick } from 'lodash';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaUpload,
	mediaUpload,
} from '@wordpress/editor';
import {
	DropZone,
	FormFileUpload,
	IconButton,
	PanelBody,
	RangeControl,
	SelectControl,
	Toolbar,
	withNotices,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import FilterToolbar from './filter-toolbar';
import Layout from './layout';
import { __ } from '../../utils/i18n';
import { ALLOWED_MEDIA_TYPES, LAYOUT_STYLES, MAX_COLUMNS } from './constants';
import { getActiveStyleName } from '../../utils';
import { icon } from '.';

const linkOptions = [
	{ value: 'attachment', label: __( 'Attachment Page' ) },
	{ value: 'media', label: __( 'Media File' ) },
	{ value: 'none', label: __( 'None' ) },
];

// @TODO keep here or move to ./layout ?
function layoutSupportsColumns( layout ) {
	return [ 'columns', 'circle', 'square' ].includes( layout );
}

export function defaultColumnsNumber( attributes ) {
	return Math.min( 3, attributes.images.length );
}

export const pickRelevantMediaFiles = image => {
	const imageProps = pick( image, [
		[ 'alt' ],
		[ 'id' ],
		[ 'link' ],
		/* @TODO Captions disabled [ 'caption' ], */
	] );
	imageProps.url =
		get( image, [ 'sizes', 'large', 'url' ] ) ||
		get( image, [ 'media_details', 'sizes', 'large', 'source_url' ] ) ||
		image.url;
	return imageProps;
};

class TiledGalleryEdit extends Component {
	state = {
		selectedImage: null,
	};

	static getDerivedStateFromProps( props, state ) {
		// Deselect images when deselecting the block
		if ( ! props.isSelected && null !== state.selectedImage ) {
			return { selectedImage: null };
		}
		return null;
	}

	setAttributes( attributes ) {
		if ( attributes.ids ) {
			throw new Error(
				'The "ids" attribute should not be changed directly. It is managed automatically when "images" attribute changes'
			);
		}

		if ( attributes.images ) {
			attributes = {
				...attributes,
				ids: attributes.images.map( ( { id } ) => parseInt( id, 10 ) ),
			};
		}

		this.props.setAttributes( attributes );
	}

	addFiles = files => {
		const currentImages = this.props.attributes.images || [];
		const { noticeOperations } = this.props;
		mediaUpload( {
			allowedTypes: ALLOWED_MEDIA_TYPES,
			filesList: files,
			onFileChange: images => {
				const imagesNormalized = images.map( image => pickRelevantMediaFiles( image ) );
				this.setAttributes( { images: currentImages.concat( imagesNormalized ) } );
			},
			onError: noticeOperations.createErrorNotice,
		} );
	};

	onRemoveImage = index => () => {
		const images = filter( this.props.attributes.images, ( img, i ) => index !== i );
		const { columns } = this.props.attributes;
		this.setState( {
			selectedImage: null,
		} );
		this.setAttributes( {
			images,
			columns: columns ? Math.min( images.length, columns ) : columns,
		} );
	};

	onSelectImage = index => () => {
		if ( this.state.selectedImage !== index ) {
			this.setState( {
				selectedImage: index,
			} );
		}
	};

	onSelectImages = images => {
		const { columns } = this.props.attributes;
		this.setAttributes( {
			columns: columns ? Math.min( images.length, columns ) : columns,
			images: images.map( image => pickRelevantMediaFiles( image ) ),
		} );
	};

	setColumnsNumber = value => this.setAttributes( { columns: value } );

	setImageAttributes = index => attributes => {
		const {
			attributes: { images },
		} = this.props;
		if ( ! images[ index ] ) {
			return;
		}
		this.setAttributes( {
			images: [
				...images.slice( 0, index ),
				{ ...images[ index ], ...attributes },
				...images.slice( index + 1 ),
			],
		} );
	};

	setLinkTo = value => this.setAttributes( { linkTo: value } );

	uploadFromFiles = event => this.addFiles( event.target.files );

	render() {
		const { selectedImage } = this.state;
		const {
			attributes,
			isSelected,
			className,
			noticeOperations,
			noticeUI,
			setAttributes,
		} = this.props;
		const {
			align,
			columns = defaultColumnsNumber( attributes ),
			imageFilter,
			images,
			linkTo,
		} = attributes;

		const dropZone = <DropZone onFilesDrop={ this.addFiles } />;

		const controls = (
			<BlockControls>
				{ !! images.length && (
					<Fragment>
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
						<FilterToolbar
							value={ imageFilter }
							onChange={ value => {
								setAttributes( { imageFilter: value } );
								this.setState( { selectedImage: null } );
							} }
						/>
					</Fragment>
				) }
			</BlockControls>
		);

		if ( images.length === 0 ) {
			return (
				<Fragment>
					{ controls }
					<MediaPlaceholder
						icon={ <div className="tiled-gallery__media-placeholder-icon">{ icon }</div> }
						className={ className }
						labels={ {
							title: __( 'Tiled Gallery' ),
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

		const layoutStyle = getActiveStyleName( LAYOUT_STYLES, attributes.className );

		return (
			<Fragment>
				{ controls }
				<InspectorControls>
					<PanelBody title={ __( 'Tiled Gallery settings' ) }>
						{ layoutSupportsColumns( layoutStyle ) && images.length > 1 && (
							<RangeControl
								label={ __( 'Columns' ) }
								value={ columns }
								onChange={ this.setColumnsNumber }
								min={ 1 }
								max={ Math.min( MAX_COLUMNS, images.length ) }
							/>
						) }
						<SelectControl
							label={ __( 'Link To' ) }
							value={ linkTo }
							onChange={ this.setLinkTo }
							options={ linkOptions }
						/>
					</PanelBody>
				</InspectorControls>

				{ noticeUI }

				<Layout
					align={ align }
					className={ className }
					columns={ columns }
					imageFilter={ imageFilter }
					images={ images }
					layoutStyle={ layoutStyle }
					linkTo={ linkTo }
					onRemoveImage={ this.onRemoveImage }
					onSelectImage={ this.onSelectImage }
					selectedImage={ isSelected ? selectedImage : null }
					setImageAttributes={ this.setImageAttributes }
				>
					{ dropZone }
					{ isSelected && (
						<div className="tiled-gallery__add-item">
							<FormFileUpload
								multiple
								isLarge
								className="tiled-gallery__add-item-button"
								onChange={ this.uploadFromFiles }
								accept="image/*"
								icon="insert"
							>
								{ __( 'Upload an image' ) }
							</FormFileUpload>
						</div>
					) }
				</Layout>
			</Fragment>
		);
	}
}

export default withNotices( TiledGalleryEdit );
