/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var MediaUtils = require( 'lib/media/utils' );

module.exports = React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewAudio',

	propTypes: {
		item: React.PropTypes.object.isRequired
	},

	render: function() {
		return (
			<audio
				src={ MediaUtils.url( this.props.item ) }
				controls
				className="media-modal-detail__preview is-audio" />
		);
	}
} );
