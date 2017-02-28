/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { loadScript, removeScriptCallback } from 'lib/load-script';
import {
	setVideoEditorHasScriptLoadError,
} from 'state/ui/editor/video-editor/actions';

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
		onPause: PropTypes.func,
	};

	static defaultProps = {
		isPlaying: false,
		onPause: noop,
	};

	componentDidMount() {
		this.loadInitializeScript();
	}

	componentWillUnmount() {
		removeScriptCallback( videoPressUrl, this.onScriptLoaded );
		this.destroy();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isPlaying && ! nextProps.isPlaying ) {
			this.pause();
		}
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
		const {
			isPlaying,
			item,
			setHasScriptLoadError,
		} = this.props;

		if ( error ) {
			log( `Script${ error.src } failed to load.` );
			setHasScriptLoadError();

			return;
		}

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

	pause() {
		if ( ! this.player || ! this.player.state ) {
			return;
		}

		if ( typeof this.player.state.pause === 'function' ) {
			this.player.state.pause();
		}

		let currentTime;

		if ( typeof this.player.state.videoAt === 'function' ) {
			currentTime = this.player.state.videoAt();
		}

		this.props.onPause( currentTime );
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

export default connect(
	null,
	{
		setHasScriptLoadError: setVideoEditorHasScriptLoadError,
	}
)( EditorMediaModalDetailPreviewVideoPress );
