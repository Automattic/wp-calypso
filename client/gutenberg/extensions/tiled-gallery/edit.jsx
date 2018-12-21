/**
 * External Dependencies
 */
import { defer, filter, pick, get } from 'lodash';
import { compose } from '@wordpress/compose';
import { withDispatch } from '@wordpress/data';
import { createRef, Component, Fragment } from '@wordpress/element';
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
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaUpload,
	mediaUpload,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import Layout from './layout';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { ALLOWED_MEDIA_TYPES, LAYOUT_STYLES, MAX_COLUMNS } from './constants';
import {
	getActiveStyleName,
	getDefaultStyleClass,
	hasStyleClass,
} from 'gutenberg/extensions/utils';
import { handleRowResize } from './resize';

const linkOptions = [
	{ value: 'attachment', label: __( 'Attachment Page' ) },
	{ value: 'media', label: __( 'Media File' ) },
	{ value: 'none', label: __( 'None' ) },
];

// @TODO keep here or move to ./layout ?
function layoutSupportsColumns( layout ) {
	return [ 'circle', 'square' ].includes( layout );
}

export function defaultColumnsNumber( attributes ) {
	return Math.min( 3, attributes.images.length );
}

export const pickRelevantMediaFiles = image => {
	const imageProps = pick( image, [ [ 'alt' ], [ 'id' ], [ 'link' ], [ 'caption' ] ] );
	imageProps.url =
		get( image, [ 'sizes', 'large', 'url' ] ) ||
		get( image, [ 'media_details', 'sizes', 'large', 'source_url' ] ) ||
		image.url;
	return imageProps;
};

class TiledGalleryEdit extends Component {
	container = createRef();

	pendingRaf = null;

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

	componentDidMount() {
		const { className } = this.props;

		// If block is missing a style class when mounting, set it to default
		if ( ! hasStyleClass( className ) ) {
			this.props.changeClassName( `${ className } ${ getDefaultStyleClass( LAYOUT_STYLES ) }` );
		}

		this.deferredMount = defer( () => {
			// ResizeObserver has checks for `window` & `document`:
			// it does nothing if those are not available.
			this.observer = new ResizeObserver( this.onGalleryResize );
			this.observer.observe( this.container.current ); //parentNode
		} );
	}

	componentWillUnmount() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
		clearTimeout( this.deferredMount );
	}

	componentDidUpdate() {
		/*
		if ( this.container.current ) {
			Array.from( this.container.current.querySelectorAll( '.tiled-gallery__row' ) ).forEach( handleRowResize );
		}
		*/
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

	onGalleryResize( [ gallery ] ) {
		if ( this.pendingRaf ) {
			cancelAnimationFrame( this.pendingRaf );
		}
		this.pendingRaf = requestAnimationFrame( () => {
			this.pendingRaf = null;
			const { width: galleryWidth } = gallery.contentRect;
			// @TODO would be nice to just use childNodes at this point but it contains
			// upload button and dropzone — could we move it outside the observed wrapper?
			const rows = Array.from( gallery.target.querySelectorAll( '.tiled-gallery__row' ) );
			rows.forEach( row => handleRowResize( row, galleryWidth ) );
		} );
	}

	onGalleryContentChange() {
		if ( this.container.current ) {
			Array.from( this.container.current.querySelectorAll( '.tiled-gallery__row' ) ).forEach(
				handleRowResize
			);
		}
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
				this.onGalleryContentChange();
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
		this.onGalleryContentChange();
	};

	onSelectImage = index => () => {
		if ( this.state.selectedImage !== index ) {
			this.setState( {
				selectedImage: index,
			} );
		}
	};

	onSelectImages = images =>
		this.setAttributes( { images: images.map( image => pickRelevantMediaFiles( image ) ) } );

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
		const { attributes, isSelected, className, noticeOperations, noticeUI } = this.props;
		const {
			align,
			columns = defaultColumnsNumber( attributes ),
			images,
			linkTo,
			className: blockStyleClassName,
		} = attributes;

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

		const layoutStyle = getActiveStyleName( LAYOUT_STYLES, blockStyleClassName );

		return (
			<Fragment>
				{ controls }
				<InspectorControls>
					<PanelBody title={ __( 'Tiled gallery settings' ) }>
						{ layoutSupportsColumns( layoutStyle ) &&
							images.length > 1 && (
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
					containerRef={ this.container }
					className={ className }
					columns={ columns }
					images={ images }
					layoutStyle={ layoutStyle }
					linkTo={ linkTo }
					onRemoveImage={ this.onRemoveImage }
					onSelectImage={ this.onSelectImage }
					selectedImage={ isSelected ? selectedImage : null }
					setImageAttributes={ this.setImageAttributes }
					isWide={ [ 'full', 'wide' ].includes( align ) }
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

export default compose( [
	withDispatch( ( dispatch, { clientId } ) => {
		return {
			changeClassName( newClassName ) {
				dispatch( 'core/editor' ).updateBlockAttributes( clientId, {
					className: newClassName,
				} );
			},
		};
	} ),
	withNotices,
] )( TiledGalleryEdit );
