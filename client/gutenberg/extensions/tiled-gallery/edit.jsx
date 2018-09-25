/** @format */

/**
 * External Dependencies
 */
import classnames from 'classnames';
import { filter, find, pick } from 'lodash';
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
// @TODO:
// Adding `@wordpress/token-list` to dependencies conflicts with current 3.0.0 version of `@wordpress/editor`
// This will still work for Jetpack, but will fail when importing the block in Calypso
// eslint-disable-next-line import/no-extraneous-dependencies
import TokenList from '@wordpress/token-list';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { LAYOUTS, MAX_COLUMNS, DEFAULT_COLUMNS } from './constants';
import GalleryImage from './gallery-image';
import LayoutStyles from './layout-styles';

export function defaultColumnsNumber( attributes ) {
	return Math.min( DEFAULT_COLUMNS, attributes.images.length );
}

/**
 * Returns the active style from the given className.
 *
 * @param {Array} styles Block style variations.
 * @param {string} className  Class name
 *
 * @return {Object?} The active style.
 *
 * From https://github.com/WordPress/gutenberg/blob/077f6c4eb9ba061bc00d5f3ae956d4789a291fb5/packages/editor/src/components/block-styles/index.js#L21-L43
 */
function getActiveStyle( styles, className ) {
	for ( const style of new TokenList( className ).values() ) {
		if ( style.indexOf( 'is-style-' ) === -1 ) {
			continue;
		}

		const potentialStyleName = style.substring( 9 );
		const activeStyle = find( styles, { name: potentialStyleName } );
		if ( activeStyle ) {
			return activeStyle;
		}
	}

	return find( styles, 'isDefault' );
}

const getActiveStyleName = className => {
	const activeStyle = getActiveStyle( LAYOUTS, className );
	return activeStyle.name;
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
			images: images.map( image => pick( image, [ 'alt', 'caption', 'id', 'link', 'url' ] ) ),
		} );
	}

	setLayout( value ) {
		this.setState( {
			layout: value,
		} );
	}

	setLinkTo( value ) {
		this.props.setAttributes( { linkTo: value } );
	}

	setColumnsNumber( value ) {
		this.props.setAttributes( { columns: value } );
	}

	toggleImageCrop() {
		this.props.setAttributes( { imageCrop: ! this.props.attributes.imageCrop } );
	}

	getImageCropHelp( checked ) {
		return checked
			? __( 'Thumbnails are cropped to align.', 'jetpack' )
			: __( 'Thumbnails are not cropped.', 'jetpack' );
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
			allowedType: 'image',
			filesList: files,
			onFileChange: images => {
				setAttributes( {
					images: currentImages.concat( images ),
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
							type="image"
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
							title: __( 'Tiled gallery', 'jetpack' ),
							name: __( 'images', 'jetpack' ),
						} }
						onSelect={ this.onSelectImages }
						accept="image/*"
						type="image"
						multiple
						notices={ noticeUI }
						onError={ noticeOperations.createErrorNotice }
					/>
				</Fragment>
			);
		}

		return (
			<Fragment>
				{ controls }
				<InspectorControls>
					<PanelBody title={ __( 'Tiled gallery Settings', 'jetpack' ) }>
						{ images.length > 1 && (
							<RangeControl
								label={ __( 'Columns', 'jetpack' ) }
								value={ columns }
								onChange={ this.setColumnsNumber }
								min={ 1 }
								disabled={ layoutsSupportingColumns.indexOf( this.state.layout ) === -1 }
								max={ Math.min( MAX_COLUMNS, images.length ) }
							/>
						) }
						<ToggleControl
							label={ __( 'Crop Images', 'jetpack' ) }
							checked={ !! imageCrop }
							onChange={ this.toggleImageCrop }
							help={ this.getImageCropHelp }
						/>
						<SelectControl
							label={ __( 'Link To', 'jetpack' ) }
							value={ linkTo }
							onChange={ this.setLinkTo }
							options={ [
								{ value: 'attachment', label: __( 'Attachment Page', 'jetpack' ) },
								{ value: 'media', label: __( 'Media File', 'jetpack' ) },
								{ value: 'none', label: __( 'None', 'jetpack' ) },
							] }
						/>
					</PanelBody>
				</InspectorControls>
				{ noticeUI }
				<LayoutStyles
					layout={ this.state.layout }
					columns={ columns }
					images={ images }
					className={ className }
				/>
				{ dropZone }
				<ul
					className={ classnames( className, {
						'is-cropped': imageCrop,
						[ `align${ align }` ]: align,
						[ `columns-${ columns }` ]: columns,
					} ) }
				>
					{ images.map( ( img, index ) => {
						return (
							<li
								className={ `tiled-gallery__item tiled-gallery__item-${ index }` }
								key={ img.id || img.url }
							>
								<GalleryImage
									url={ img.url }
									alt={ img.alt }
									id={ img.id }
									isSelected={ isSelected && this.state.selectedImage === index }
									onRemove={ this.onRemoveImage( index ) }
									onSelect={ this.onSelectImage( index ) }
									setAttributes={ attrs => this.setImageAttributes( index, attrs ) }
									caption={ this.state.layout !== 'circle' ? img.caption : '' }
									captionEnabled={ this.state.layout !== 'circle' }
								/>
							</li>
						);
					} ) }
					{ isSelected && (
						<li className={ `tiled-gallery__item has-add-item-button` }>
							<FormFileUpload
								multiple
								isLarge
								className="block-library-gallery-add-item-button"
								onChange={ this.uploadFromFiles }
								accept="image/*"
								icon="insert"
							>
								{ __( 'Upload an image', 'jetpack' ) }
							</FormFileUpload>
						</li>
					) }
				</ul>
			</Fragment>
		);
	}
}

export default withNotices( TiledGalleryEdit );
