/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import uniq from 'lodash/uniq';
import { VideoPressFileTypes } from 'lib/media/constants';
import { updateShortcodes } from 'state/shortcodes/actions';

const MediaLibraryUploadButton = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		onAddMedia: React.PropTypes.func,
		className: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			onAddMedia: noop
		};
	},

	uploadFiles: function( event ) {
		if ( event.target.files && this.props.site ) {
			MediaActions.clearValidationErrors( this.props.site.ID );
			MediaActions.add( this.props.site.ID, event.target.files, this.props.updateShortcodes );
		}

		ReactDom.findDOMNode( this.refs.form ).reset();
		this.props.onAddMedia();
		analytics.mc.bumpStat( 'editor_upload_via', 'add_button' );
	},

	/**
	 * Returns a string of comma-separated file extensions supported for the
	 * current site, to be used as the `accept` attribute in an `input` element
	 * of type `file`. This is a non-standard use of the `accept` attribute,
	 * but is supported in Internet Explorer and Chrome browsers. Further input
	 * validation will occur when attempting to upload the file.
	 *
	 * @return {string} Supported file extensions, as comma-separated string
	 */
	getInputAccept: function() {
		if ( ! MediaUtils.isSiteAllowedFileTypesToBeTrusted( this.props.site ) ) {
			return null;
		}
		const allowedFileTypesForSite = MediaUtils.getAllowedFileTypesForSite( this.props.site );

		return uniq( allowedFileTypesForSite.concat( VideoPressFileTypes ) ).map( ( type ) => `.${type}` ).join();
	},

	render: function() {
		var classes = classNames( 'media-library__upload-button', this.props.className );

		return (
			<form ref="form" className={ classes }>
				<span>{ this.props.children }</span>
				<input
					type="file"
					accept={ this.getInputAccept() }
					multiple
					onChange={ this.uploadFiles }
					className="media-library__upload-button-input" />
			</form>
		);
	}
} );

export default connect(
	null,
	{
		updateShortcodes
	}
)( MediaLibraryUploadButton );
