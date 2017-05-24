/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { head, uniqueId, find, noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { errorNotice as errorNoticeAction } from 'state/notices/actions';

import DropZone from 'components/drop-zone';
import FilePicker from 'components/file-picker';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import MediaStore from 'lib/media/store';

class ProductImageUploader extends Component {
	static propTypes = {
		siteId: PropTypes.number,
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

	onPick = ( files ) => {
		const { siteId, multiple } = this.props;
		const { translate, errorNotice } = this.props;
		const { onSelect, onUpload, onError, onFinish } = this.props;

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
					onUpload( {
						ID: media.ID,
						transientId,
						URL: media.URL,
						placeholder: file.preview,
					} );
					uploadedIds.push( transientId );
				} else {
					onError( {
						file: media,
						transientId,
					} );
					errorNotice( translate( 'There was a problem uploading %s.', {
						args: media && media.file || translate( 'an image' )
					} ) );
				}

				transientIds.shift();
				if ( transientIds.length === 0 ) {
					MediaStore.off( 'change', handleUpload );
					onFinish( uploadedIds );
				}
			}
		};

		MediaStore.on( 'change', handleUpload );
		MediaActions.add( siteId, filesToUpload );
	}

	renderCompactUploader() {
		const { multiple } = this.props;
		return (
			<div className="product-image-uploader__picker compact">
				<FilePicker multiple={ multiple } accept="image/*" onPick={ this.onPick } >
					<Gridicon icon="add-outline" size={ 24 } />
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
						<Gridicon icon="add-outline" size={ 36 } />
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

	render() {
		const { compact, children, multiple } = this.props;

		if ( children !== undefined ) {
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
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
	};
}

export default connect( mapStateToProps, { errorNotice: errorNoticeAction } )( localize( ProductImageUploader ) );
