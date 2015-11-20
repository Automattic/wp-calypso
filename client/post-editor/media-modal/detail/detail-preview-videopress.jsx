/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const loadScript = require( 'lib/load-script' ).loadScript;

module.exports = React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewVideoPress',

	propTypes: {
		item: React.PropTypes.object.isRequired
	},

	componentDidMount() {
		this.loadInitializeScript();
	},

	componentDidUpdate( prevProps ) {
		if ( this.props.item.videopress_guid !== prevProps.item.videopress_guid ) {
			this.loadInitializeScript();
		}
	},

	loadInitializeScript() {
		loadScript( 'https://videopress.com/videopress-iframe.js' );
	},

	getEmbedUrl() {
		return `https://videopress.com/embed/${ this.props.item.videopress_guid }`;
	},

	render() {
		return (
			<iframe
				src={ this.getEmbedUrl() }
				frameBorder="0"
				width={ this.props.item.width }
				height={ this.props.item.height }
				allowFullScreen
				className="editor-media-modal-detail__preview is-video" />
		);
	}
} );
