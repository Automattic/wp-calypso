/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var EmptyContent = require( 'components/empty-content' ),
	UploadButton = require( './upload-button' );

module.exports = React.createClass( {
	displayName: 'MediaLibraryListNoContent',

	propTypes: {
		site: React.PropTypes.object,
		filter: React.PropTypes.string
	},

	getLabel: function() {
		var label;

		switch ( this.props.filter ) {
			case 'images':
				label = this.translate( 'You don\'t have any images.', { textOnly: true, context: 'Media no results' } );
				break;
			case 'videos':
				label = this.translate( 'You don\'t have any videos.', { textOnly: true, context: 'Media no results' } );
				break;
			case 'audio':
				label = this.translate( 'You don\'t have any audio files.', { textOnly: true, context: 'Media no results' } );
				break;
			case 'documents':
				label = this.translate( 'You don\'t have any documents.', { textOnly: true, context: 'Media no results' } );
				break;
			default:
				label = this.translate( 'You don\'t have any media.', { textOnly: true, context: 'Media no results' } );
				break;
		}

		return label;
	},

	render: function() {
		var action = (
			<UploadButton className="button is-primary" site={ this.props.site }>
				{ this.translate( 'Upload Media' ) }
			</UploadButton>
		);

		return (
			<EmptyContent
				title={ this.getLabel() }
				line={ this.translate( 'Would you like to upload something?' ) }
				action={ action }
				illustration={ '/calypso/images/drake/drake-nomedia.svg' } />
		);
	}
} );
