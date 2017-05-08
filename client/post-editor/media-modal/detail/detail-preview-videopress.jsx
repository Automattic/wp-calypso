/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { loadScript, removeScriptCallback } from 'lib/load-script';

/**
 * Module variables
 */
const log = debug( 'calypso:post-editor:videopress' );
const videoPressUrl = 'https://wordpress.com/wp-content/plugins/video/assets/js/next/videopress.js';

class EditorMediaModalDetailPreviewVideoPress extends Component {
	static propTypes = {
		className: PropTypes.string,
		isPlaying: PropTypes.bool,
		item: PropTypes.object.isRequired,
	};

	static defaultProps = {
		isPlaying: false,
	};

	componentDidMount() {
		this.loadInitializeScript();
	}

	componentWillUnmount() {
		removeScriptCallback( videoPressUrl, this.onScriptLoaded );
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
		loadScript( videoPressUrl, this.onScriptLoaded );
	}

	onScriptLoaded = ( error ) => {
		if ( error ) {
			log( `Script${ error.src } failed to load.` );
			return;
		}

		const {
			isPlaying,
			item,
		} = this.props;

		if ( typeof window !== 'undefined' && window.videopress ) {
			this.player = window.videopress( item.videopress_guid, this.video, {
				autoPlay: isPlaying,
				height: item.height,
				width: item.width,
			} );
		}
	};

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
		const classes = classNames( this.props.className, 'is-video' );

		return (
			<div
				className={ classes }
				ref={ this.setVideoInstance }>
			</div>
		);
	}
}

export default EditorMediaModalDetailPreviewVideoPress;
