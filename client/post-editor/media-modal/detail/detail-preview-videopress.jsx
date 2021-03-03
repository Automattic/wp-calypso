/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { get, invoke, noop } from 'lodash';
import classNames from 'classnames';
import debug from 'debug';
import wpcomProxyRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { loadScript, removeScriptCallback } from '@automattic/load-script';

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

	UNSAFE_componentWillReceiveProps( nextProps ) {
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

	// Run requests through the rest proxy to support loading private videos.
	requestProvider = ( observable ) => {
		return () => {
			return observable( ( set, reject, done ) => {
				const { videopress_guid: guid } = this.props.item;

				if ( ! guid ) {
					return;
				}

				const getVideo = ( id ) => {
					const data = { path: '/videos/' + id };

					wpcomProxyRequest( data, function ( err, body, headers ) {
						if ( err ) {
							return;
						}

						// If an upload_date property is present, we have a valid response.
						if ( body.upload_date != null ) {
							done( body );
						} else {
							const error = new Error( body ? body.message : 'Unknown' );
							error.code = body ? body.error : null;
							error.errorMessage = body ? body.errorMessage : null;
							error.status = headers.status;
							reject( error );
						}
					} );
				};

				getVideo( guid );

				return () => {};
			} );
		};
	};

	setVideoInstance = ( ref ) => ( this.video = ref );

	loadInitializeScript() {
		loadScript( videoPressUrl, this.onScriptLoaded );
	}

	onScriptLoaded = ( error ) => {
		const { isPlaying, item, onScriptLoadError } = this.props;

		if ( error ) {
			log( `Script${ get( error, 'src', '' ) } failed to load.` );
			onScriptLoadError();

			return;
		}

		const { height = 480, videopress_guid, width = 854 } = item;

		if ( ! videopress_guid ) {
			return;
		}

		if ( typeof window !== 'undefined' && window.videopress ) {
			this.player = window.videopress( videopress_guid, this.video, {
				autoPlay: isPlaying,
				height,
				width,
				requestProvider: this.requestProvider,
			} );
		}
	};

	receiveMessage = ( event ) => {
		if ( event.origin && event.origin !== location.origin ) {
			return;
		}

		const { data } = event;

		if (
			! data ||
			'videopress_loading_state' !== data.event ||
			! ( 'state' in data ) ||
			! ( 'converting' in data )
		) {
			return;
		}

		if ( 'loaded' === data.state && ! data.converting ) {
			this.props.onVideoLoaded();
		}
	};

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
		const playerState = get( this, 'player.state' );

		if ( ! playerState ) {
			return;
		}

		invoke( this, 'player.state.play' );
	}

	pause() {
		const playerState = get( this, 'player.state' );

		if ( ! playerState ) {
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

		return <div className={ classes } ref={ this.setVideoInstance } />;
	}
}

export default EditorMediaModalDetailPreviewVideoPress;
