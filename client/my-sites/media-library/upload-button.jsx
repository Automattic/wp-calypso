/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	noop = require( 'lodash/utility/noop' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	MediaActions = require( 'lib/media/actions' ),
	MediaUtils = require( 'lib/media/utils' );

module.exports = React.createClass( {
	displayName: 'MediaLibraryUploadButton',

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

		return MediaUtils.getAllowedFileTypesForSite( this.props.site ).map( ( type ) => `.${type}` ).join();
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
