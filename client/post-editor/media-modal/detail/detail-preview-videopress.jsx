/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import debug from 'debug';

/**
 * Internal dependencies
 */
import loadScript from 'lib/load-script';

/**
 * Module variables
 */
const log = debug( 'calypso:post-editor:videopress' );
const videoPressUrl = 'https://wordpress.com/wp-content/plugins/video/assets/js/next/videopress.js';

class EditorMediaModalDetailPreviewVideoPress extends Component {
	static propTypes = {
		isPlaying: PropTypes.bool,
		item: PropTypes.object.isRequired,
	};

	static defaultProps = {
		isPlaying: false,
	};

	constructor() {
		super();

		this.onScriptLoaded = this.onScriptLoaded.bind( this );
	}

	componentDidMount() {
		this.loadInitializeScript();
	}

	componentWillUnmount() {
		loadScript.removeScriptCallback( videoPressUrl, this.onScriptLoaded );
		this.destroy();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.item.videopress_guid !== prevProps.item.videopress_guid ) {
			this.destroy();
			this.loadInitializeScript();
		}
	}

	shouldComponentUpdate( nextProps ) {
		if ( this.props.item.videopress_guid !== nextProps.item.videopress_guid ) {
			return true;
		}

		return false;
	}

	setVideoInstance = ref => this.video = ref;

	loadInitializeScript() {
		loadScript.loadScript( videoPressUrl, this.onScriptLoaded );
	}

	onScriptLoaded( error ) {
		if ( error ) {
			log( `Script${ error.src } failed to load.` );
			return;
		}

		/* eslint-disable no-undef */
		this.player = videopress( this.props.item.videopress_guid, this.video, {
		/* eslint-enable no-undef */
			autoPlay: this.props.isPlaying,
			height: this.props.item.height,
			width: this.props.item.width,
		} );
	}

	destroy() {
		if ( ! this.player ) {
			return;
		}

		this.player.destroy();

		// Remove DOM created outside of React.
		while ( this.video.firstChild ) {
			this.video.removeChild( this.video.firstChild );
		}
	}

	render() {
		return (
			<div
				className="editor-media-modal-detail__preview is-video"
				ref={ this.setVideoInstance }>
			</div>
		);
	}
}

export default EditorMediaModalDetailPreviewVideoPress;
