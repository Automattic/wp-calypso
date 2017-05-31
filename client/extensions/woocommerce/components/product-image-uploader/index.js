/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { head, uniqueId, find, noop } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteIdWithFallback } from 'woocommerce/state/sites/selectors';
import { errorNotice as errorNoticeAction } from 'state/notices/actions';

import DropZone from 'components/drop-zone';
import FilePicker from 'components/file-picker';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import MediaStore from 'lib/media/store';
import MediaValidationStore from 'lib/media/validation-store';

class ProductImageUploader extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			options: PropTypes.object.isRequired,
		} ),
		multiple: PropTypes.bool,
		compact: PropTypes.bool,
		onSelect: PropTypes.func,
		onUpload: PropTypes.func,
		onError: PropTypes.func,
		onFinish: PropTypes.func,
	};

	static defaultProps = {
		multiple: true,
		compact: false,
		onSelect: noop,
		onUpload: noop,
		onError: noop,
		onFinish: noop,
	}

	state = {
		errors: [],
	};

	showError = ( media, transientId ) => {
		const { onError, errorNotice, translate } = this.props;
		const { errors } = this.state;

		onError( {
			file: media,
			transientId,
		} );

		let extraDetails;
		const validationError = errors[ transientId ] || [];
		switch ( head( validationError ) ) {
			case 'EXCEEDS_MAX_UPLOAD_SIZE' :
				extraDetails = translate( 'This file exceeds the maximum upload size for this site.' );
				break;
			case 'EXCEEDS_PLAN_STORAGE_LIMIT' :
			case 'NOT_ENOUGH_SPACE' :
				extraDetails = translate( 'You have reached your plan storage limit.' );
				break;
		}

		let message;
		if ( media && media.file ) {
			message = translate( 'There was a problem uploading %s.', {
				args: media.file
			} );
		} else {
			message = translate( 'There was a problem uploading your image.' );
		}

		errorNotice( extraDetails && ( message + ' ' + extraDetails ) || message );
	}

	storeValidationErrors = () => {
		this.setState( {
			errors: MediaValidationStore.getAllErrors( this.props.site.ID ),
		} );
	}

	onPick = ( files ) => {
		const { site, multiple } = this.props;
		const { onSelect, onUpload, onFinish } = this.props;
		const siteId = site.ID;

		// DropZone supplies an array, FilePicker supplies a FileList
		let images = Array.isArray( files ) ? MediaUtils.filterItemsByMimePrefix( files, 'image' ) : [ ...files ];
		if ( ! images ) {
			return false;
		}

		if ( multiple === false ) {
			images = [ images.shift() ];
		}

		const transientIds = [];
		const filesToUpload = [];
		images.forEach( function( image ) {
			const transientId = uniqueId( 'product-images-' );
			transientIds.push( transientId );
			filesToUpload.push( {
				ID: transientId,
				fileContents: image,
				fileName: image.name,
				preview: URL.createObjectURL( image ),
			} );
		} );

		onSelect( filesToUpload );

		const uploadedIds = [];
		const handleUpload = () => {
			const transientId = head( transientIds );
			const media = MediaStore.get( siteId, transientId );
			const isUploadInProgress = media && MediaUtils.isItemBeingUploaded( media );

			// File has finished uploading or failed.
			if ( ! isUploadInProgress ) {
				if ( media ) {
					const file = find( filesToUpload, ( f ) => f.ID === transientId );
					if ( media.URL ) {
						onUpload( {
							ID: media.ID,
							transientId,
							URL: media.URL,
							placeholder: file.preview,
						} );
						uploadedIds.push( transientId );
					} else {
						this.showError( media, transientId );
					}
				} else {
					this.showError( media, transientId );
				}

				transientIds.shift();
				if ( transientIds.length === 0 ) {
					MediaStore.off( 'change', handleUpload );
					onFinish( uploadedIds );
				}
			}
		};

		MediaValidationStore.on( 'change', this.storeValidationErrors );
		MediaStore.on( 'change', handleUpload );
		MediaActions.add( siteId, filesToUpload );
	}

	renderCompactUploader() {
		const { multiple } = this.props;
		return (
			<div className="product-image-uploader__picker compact">
				<FilePicker multiple={ multiple } accept="image/*" onPick={ this.onPick } >
					<Gridicon icon="add-image" size={ 24 } />
				</FilePicker>
			</div>
		);
	}

	renderUploader() {
		const { translate, multiple } = this.props;
		return (
			<div className="product-image-uploader__wrapper">
				<div className="product-image-uploader__picker">
					<FilePicker multiple={ multiple } accept="image/*" onPick={ this.onPick }>
						<Gridicon icon="add-image" size={ 36 } />
						<p>{ translate( 'Add images' ) }</p>
					</FilePicker>
				</div>
				<DropZone onFilesDrop={ this.onPick } />
			</div>
		);
	}

	renderChildren() {
		return React.Children.map( this.props.children, function( child ) {
			return <div>{ child }</div>;
		} );
	}

	renderPlaceholder() {
		const { translate } = this.props;
		return (
			<div className="product-image-uploader__wrapper placeholder">
				<div className="product-image-uploader__picker">
					<div className="product-image-uploader__file-picker">
						<Gridicon icon="add-image" size={ 36 } />
						<p>{ translate( 'Loading' ) }</p>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const { compact, children, multiple, site } = this.props;

		if ( ! site ) {
			return this.renderPlaceholder();
		}

		if ( 'undefined' !== typeof children ) {
			return (
				<FilePicker multiple={ multiple } accept="image/*" onPick={ this.onPick }>
					{ this.renderChildren() }
				</FilePicker>
			);
		}

		return compact && this.renderCompactUploader() || this.renderUploader();
	}

}

function mapStateToProps( state ) {
	const site = getSelectedSiteIdWithFallback( state );
	return {
		site,
	};
}

export default connect( mapStateToProps, { errorNotice: errorNoticeAction } )( localize( ProductImageUploader ) );
