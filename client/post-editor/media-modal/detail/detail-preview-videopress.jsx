/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { get, invoke, noop, pick } from 'lodash';
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
		onPause: PropTypes.func,
		onScriptLoadError: PropTypes.func,
		onVideoLoaded: PropTypes.func,
	};

	static defaultProps = {
		isPlaying: false,
		onPause: noop,
		onScriptLoadError: noop,
		onVideoLoaded: noop,
	};

	componentDidMount() {
		this.loadInitializeScript();
		window.addEventListener( 'message', this.receiveMessage, false );
	}

	componentWillUnmount() {
		removeScriptCallback( videoPressUrl, this.onScriptLoaded );
		this.destroy();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isPlaying && ! nextProps.isPlaying ) {
			this.pause();
		} else if ( ! this.props.isPlaying && nextProps.isPlaying ) {
			this.play();
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
			onScriptLoadError,
		} = this.props;

		if ( error ) {
			log( `Script${ get( error, 'src', '' ) } failed to load.` );
			onScriptLoadError();

			return;
		}

		const {
			height = 480,
			videopress_guid,
			width = 854,
		} = pick( item, [ 'videopress_guid', 'height', 'width' ] );

		if ( ! videopress_guid ) {
			return;
		}

		if ( typeof window !== 'undefined' && window.videopress ) {
			this.player = window.videopress( videopress_guid, this.video, {
				autoPlay: isPlaying,
				height: height,
				width: width,
			} );
		}
	};

	receiveMessage = ( event ) => {
		if ( event.origin && event.origin !== location.origin ) {
			return;
		}

		const data = event.data;

		if ( ! data || 'videopress_loading_state' !== data.event || ! ( 'state' in data ) || ! ( 'converting' in data ) ) {
			return;
		}

		if ( ( 'loaded' === data.state ) && ! data.converting ) {
			this.props.onVideoLoaded();
		}
	}

	destroy() {
		window.removeEventListener( 'message', this.receiveMessage );

		if ( ! this.player ) {
			return;
		}

		invoke( this, 'player.destroy' );

		// Remove DOM created outside of React.
		while ( this.video.firstChild ) {
			this.video.removeChild( this.video.firstChild );
		}
	}

	play() {
		if ( ! this.player || ! this.player.state ) {
			return;
		}

		invoke( this, 'player.state.play' );
	}

	pause() {
		if ( ! this.player || ! this.player.state ) {
			return;
		}

		invoke( this, 'player.state.pause' );

		const currentTime = invoke( this, 'player.state.videoAt' );

		if ( ! currentTime ) {
			return;
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
)( EditorMediaModalDetailPreviewVideoPress );
