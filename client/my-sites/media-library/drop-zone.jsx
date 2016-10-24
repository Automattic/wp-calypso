/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import DropZone from 'components/drop-zone';
import MediaActions from 'lib/media/actions';
import { userCan } from 'lib/site/utils';

module.exports = React.createClass( {
	displayName: 'MediaLibraryDropZone',

	propTypes: {
		site: React.PropTypes.object,
		fullScreen: React.PropTypes.bool,
		onAddMedia: React.PropTypes.func,
		trackStats: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			fullScreen: true,
			onAddMedia: noop,
			trackStats: true
		};
	},

	uploadFiles: function( files ) {
		if ( ! this.props.site ) {
			return;
		}

		MediaActions.clearValidationErrors( this.props.site.ID );
		MediaActions.add( this.props.site.ID, files );
		this.props.onAddMedia();

		if ( this.props.trackStats ) {
			analytics.mc.bumpStat( 'editor_upload_via', 'drop' );
		}
	},

	isValidTransfer: function( transfer ) {
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
		// See: http://www.w3.org/html/wg/drafts/html/master/editing.html#the-datatransfer-interface
		return ! transfer.types || -1 !== Array.prototype.indexOf.call( transfer.types, 'Files' );
	},

	render: function() {
		if ( ! userCan( 'upload_files', this.props.site ) ) {
			return null;
		}

		return (
			<DropZone
				fullScreen={ this.props.fullScreen }
				onVerifyValidTransfer={ this.isValidTransfer }
				onFilesDrop={ this.uploadFiles } />
		);
	}
} );
