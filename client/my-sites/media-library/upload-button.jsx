/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import uniq from 'lodash/uniq';
import { VideoPressFileTypes } from 'lib/media/constants';

module.exports = React.createClass( {
	displayName: 'MediaLibraryUploadButton',

	propTypes: {
		site: React.PropTypes.object,
		onAddMedia: React.PropTypes.func,
		className: React.PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			onAddMedia: noop,
			type: 'button',
			href: null,
		};
	},

	onClick: function() {
		if ( this.props.href ) {
			page( this.props.href );
		}
	},

	uploadFiles: function( event ) {
		if ( event.target.files && this.props.site ) {
			MediaActions.clearValidationErrors( this.props.site.ID );
			MediaActions.add( this.props.site.ID, event.target.files );
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
		var classes = classNames( 'media-library__upload-button', 'button', this.props.className );

		return (
			<form ref="form" className={ classes }>
				{ this.props.children }
				<input
					type="file"
					accept={ this.getInputAccept() }
					multiple
					onChange={ this.uploadFiles }
					onClick={ this.onClick }
					className="media-library__upload-button-input" />
			</form>
		);
	}
} );
