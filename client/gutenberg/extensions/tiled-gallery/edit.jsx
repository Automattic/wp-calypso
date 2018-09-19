/** @format */

/**
 * External Dependencies
 */
import pick from 'lodash/pick';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaUpload,
	mediaUpload,
} from '@wordpress/editor';
import {
	DropZone,
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
import TiledGallerySave from './save.jsx';

/**
 * Module variables
 */
const MAX_COLUMNS = 8;
const linkOptions = [
	{ value: 'attachment', label: __( 'Attachment Page' ) },
	{ value: 'media', label: __( 'Media File' ) },
	{ value: 'none', label: __( 'None' ) },
];

class TiledGalleryEdit extends Component {
	constructor() {
		super( ...arguments );

		this.onSelectImage = this.onSelectImage.bind( this );
		this.onSelectImages = this.onSelectImages.bind( this );
		this.setLinkTo = this.setLinkTo.bind( this );
		this.setColumnsNumber = this.setColumnsNumber.bind( this );
		this.setImageAttributes = this.setImageAttributes.bind( this );
		this.addFiles = this.addFiles.bind( this );

		this.state = {
			selectedImage: null,
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

	onSelectImages( images ) {
		this.props.setAttributes( {
			images: images.map( image => pick( image, [ 'alt', 'caption', 'id', 'url', 'link' ] ) ),
		} );
	}

	setLinkTo( value ) {
		this.props.setAttributes( { linkTo: value } );
	}

	setColumnsNumber( value ) {
		this.props.setAttributes( { columns: value } );
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
			// @TODO refactor
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( {
				selectedImage: null,
				captionSelected: false,
			} );
		}
	}

	render() {
		const { attributes, className, isSelected, noticeOperations, noticeUI } = this.props;
		const { images, columns, linkTo } = attributes;

		const dropZone = <DropZone key="item-dropzone" onFilesDrop={ this.addFiles } />;

		const controls = isSelected && (
			<BlockControls key="controls">
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
					{ noticeUI }
					<MediaPlaceholder
						key="gallery-placeholder"
						className={ className }
						icon="format-gallery"
						labels={ {
							title: __( 'Tiled Gallery' ),
							name: __( 'images' ),
						} }
						onSelect={ this.onSelectImages }
						notices={ noticeUI }
						onError={ noticeOperations.createErrorNotice }
						accept="image/*"
						type="image"
						multiple
					/>
				</Fragment>
			);
		}

		// To avoid users accidentally navigating out of Gutenberg by clicking an image, we disable linkTo in the editor view here by forcing 'none'.
		const imageTiles = (
			<TiledGallerySave
				attributes={ {
					className,
					images,
					columns,
					linkTo: 'none',
				} }
			/>
		);

		return (
			<Fragment>
				{ controls }
				{ isSelected && (
					<InspectorControls key="inspector">
						<PanelBody title={ __( 'Tiled Gallery Settings' ) }>
							{ images.length > 1 && (
								<RangeControl
									label={ __( 'Columns' ) }
									value={ columns }
									onChange={ this.setColumnsNumber }
									min={ 1 }
									max={ Math.min( MAX_COLUMNS, images.length ) }
								/>
							) }
							<SelectControl
								label={ __( 'Link to' ) }
								value={ linkTo }
								onChange={ this.setLinkTo }
								options={ linkOptions }
							/>
						</PanelBody>
					</InspectorControls>
				) }
				{ dropZone }
				{ noticeUI }
				{ imageTiles }
			</Fragment>
		);
	}
}

export default withNotices( TiledGalleryEdit );
