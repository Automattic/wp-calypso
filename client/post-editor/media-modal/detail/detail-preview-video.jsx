/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const MediaUtils = require( 'lib/media/utils' ),
	EditorMediaModalDetailItemVideoPress = require( './detail-preview-videopress' );

module.exports = React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewVideo',

	propTypes: {
		item: React.PropTypes.object.isRequired
	},

	render() {
		if ( MediaUtils.isVideoPressItem( this.props.item ) ) {
			return <EditorMediaModalDetailItemVideoPress { ...this.props } />;
		}

		return (
			<video
				src={ MediaUtils.url( this.props.item ) }
				controls
				className="media-modal-detail__preview is-video" />
		);
	}
} );
