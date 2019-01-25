/** @format */

/**
 * External dependencies
 */

import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { Component, Fragment } from '@wordpress/element';
import {
	BlockControls,
	MediaUpload,
	MediaPlaceholder,
	InspectorControls,
	mediaUpload,
} from '@wordpress/editor';

import { IconButton, PanelBody, SelectControl, Toolbar, withNotices } from '@wordpress/components';
import { filter, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Slideshow from './slideshow';

const ALLOWED_MEDIA_TYPES = [ 'image' ];

const effectOptions = [
	{ label: _x( 'Slide', 'Slideshow transition effect' ), value: 'slide' },
	{ label: _x( 'Fade', 'Slideshow transition effect' ), value: 'fade' },
	{ label: _x( 'Cover Flow', 'Slideshow transition effect' ), value: 'coverflow' },
	{ label: _x( 'Flip', 'Slideshow transition effect' ), value: 'flip' },
];

export const pickRelevantMediaFiles = image =>
	pick( image, [ 'alt', 'id', 'link', 'url', 'caption' ] );

class SlideshowEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			selectedImage: null,
		};
	}
	onSelectImages = images => {
		const { setAttributes } = this.props;
		const mapped = images.map( image => pickRelevantMediaFiles( image ) );
		setAttributes( {
			images: mapped,
		} );
	};
	onSelectImage = index => {
		return () => {
			if ( this.state.selectedImage !== index ) {
				this.setState( {
					selectedImage: index,
				} );
			}
		};
	};
	onRemoveImage = index => {
		return () => {
			const images = filter( this.props.attributes.images, ( img, i ) => index !== i );
			this.setState( { selectedImage: null } );
			this.props.setAttributes( { images } );
		};
	};
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
	render() {
		const { attributes, className, noticeOperations, noticeUI, setAttributes } = this.props;
		const { align, effect, images } = attributes;
		const controls = (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Effects' ) }>
						<SelectControl
							label={ __( 'Transition effect' ) }
							value={ effect }
							onChange={ value => {
								setAttributes( { effect: value } );
							} }
							options={ effectOptions }
						/>
					</PanelBody>
				</InspectorControls>
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
										label={ __( 'Edit Slideshow' ) }
										icon="edit"
										onClick={ open }
									/>
								) }
							/>
						</Toolbar>
					) }
				</BlockControls>
			</Fragment>
		);

		if ( images.length === 0 ) {
			return (
				<Fragment>
					{ controls }
					<MediaPlaceholder
						icon="format-gallery"
						className={ className }
						labels={ {
							title: __( 'Slideshow' ),
							instructions: __( 'Drag images, upload new ones or select files from your library.' ),
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
		return (
			<Fragment>
				{ controls }
				{ noticeUI }
				<Slideshow align={ align } className={ className } effect={ effect } images={ images } />
			</Fragment>
		);
	}
}

export default withNotices( SlideshowEdit );
