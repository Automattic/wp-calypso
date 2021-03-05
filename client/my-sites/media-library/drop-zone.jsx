/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { bumpStat } from 'calypso/lib/analytics/mc';
import DropZone from 'calypso/components/drop-zone';
import { userCan } from 'calypso/lib/site/utils';
import { clearMediaItemErrors } from 'calypso/state/media/actions';
import { addMedia } from 'calypso/state/media/thunks';

class MediaLibraryDropZone extends React.Component {
	static displayName = 'MediaLibraryDropZone';

	static propTypes = {
		site: PropTypes.object,
		fullScreen: PropTypes.bool,
		onAddMedia: PropTypes.func,
		trackStats: PropTypes.bool,
		addMedia: PropTypes.func,
	};

	static defaultProps = {
		fullScreen: true,
		onAddMedia: noop,
		trackStats: true,
	};

	uploadFiles = ( files ) => {
		if ( ! this.props.site || ! userCan( 'upload_files', this.props.site ) ) {
			return;
		}

		this.props.clearMediaItemErrors( this.props.site.ID );
		this.props.addMedia( files, this.props.site );
		this.props.onAddMedia();

		if ( this.props.trackStats ) {
			bumpStat( 'editor_upload_via', 'drop' );
		}
	};

	isValidTransfer = ( transfer ) => {
		if ( ! transfer ) {
			return false;
		}

		// Firefox will claim that images dragged from within the same page are
		// files, but will also identify them with a `mozSourceNode` attribute.
		// This value will be `null` for files dragged from outside the page.
		//
		// See: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/mozSourceNode
		if ( transfer.mozSourceNode ) {
			return false;
		}

		// `types` is a DOMStringList, which is treated as an array in Chrome,
		// but as an array-like object in Firefox. Therefore, we call `indexOf`
		// using the Array prototype. Safari may pass types as `null` which
		// makes detection impossible, so we err on allowing the transfer.
		//
		// See: https://html.spec.whatwg.org/multipage/dnd.html#the-datatransfer-interface
		return ! transfer.types || -1 !== Array.prototype.indexOf.call( transfer.types, 'Files' );
	};

	render() {
		const { site, fullScreen, translate } = this.props;
		const canUploadFiles = userCan( 'upload_files', site );
		const textLabel = ! canUploadFiles
			? translate( 'You are not authorized to upload files to this site' )
			: null;
		const icon = ! canUploadFiles ? (
			<Gridicon icon="cross" size={ 48 } />
		) : (
			<Gridicon icon="cloud-upload" size={ 48 } />
		);
		return (
			<DropZone
				fullScreen={ fullScreen }
				onVerifyValidTransfer={ this.isValidTransfer }
				onFilesDrop={ this.uploadFiles }
				textLabel={ textLabel }
				icon={ icon }
			/>
		);
	}
}

export default connect( null, { addMedia, clearMediaItemErrors } )(
	localize( MediaLibraryDropZone )
);
