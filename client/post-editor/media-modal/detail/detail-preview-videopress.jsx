import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';
import { withCurrentRoute } from 'calypso/components/route';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Module variables
 */
const noop = () => {};

class EditorMediaModalDetailPreviewVideoPress extends Component {
	static propTypes = {
		className: PropTypes.string,
		isPlaying: PropTypes.bool,
		item: PropTypes.object.isRequired,
		onPause: PropTypes.func,
		onVideoLoaded: PropTypes.func,
	};

	static defaultProps = {
		isPlaying: false,
		onPause: noop,
		onVideoLoaded: noop,
	};

	constructor( props ) {
		super( props );

		this.autoplay = props.isPlaying;
	}

	autoplay = false;

	componentDidMount() {
		window.addEventListener( 'message', this.receiveMessage, false );
	}

	componentWillUnmount() {
		this.destroy();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.isPlaying && ! this.props.isPlaying ) {
			this.pause();
		} else if ( ! prevProps.isPlaying && this.props.isPlaying ) {
			this.play();
		}
	}

	setVideoInstance = ( ref ) => ( this.video = ref );

	receiveMessage = ( event ) => {
		const { data } = event;

		if ( ! data || ! data.event ) {
			return;
		}

		// events received from calypso
		if ( 'videopress_refresh_iframe' === data.event ) {
			// in a timeout to guard against a race condition with cache not being busted prior to this message being received
			// and the `privacy_setting` not being accurate as a result.
			// Potential solution to this is to prevent the `videopress_refresh_iframe` message from being SENT until
			// the update has completed.
			setTimeout( () => {
				this.video.src += ''; // force reload of potentially cross-origin iframe
			}, 1000 );
		}

		// events received from player only
		if ( event.origin && event.origin !== 'https://video.wordpress.com' ) {
			return;
		}

		if (
			'videopress_loading_state' === data.event &&
			'loaded' === data.state &&
			! data.converting
		) {
			this.props.onVideoLoaded();
		} else if ( 'videopress_action_pause_response' === data.event ) {
			let currentTime = data.currentTimeMs ?? -1;
			let isMillisec = true;
			if ( currentTime < 0 ) {
				currentTime = data.currentTime;
				isMillisec = false;
			}
			this.props.onPause( currentTime, isMillisec );
		}

		if ( 'videopress_token_request' === data.event ) {
			this.requestVideoPressToken( event );
		}
	};

	requestVideoPressToken = ( event ) => {
		const { siteId } = this.props;
		const guid = event.data.guid;
		const proxiedWpcom = wpcom();
		proxiedWpcom.request = proxyRequest;

		const path = `/sites/${ siteId }/media/videopress-playback-jwt/${ guid }`;
		proxiedWpcom.req.post( { path, apiNamespace: 'wpcom/v2' } ).then( function ( response ) {
			if ( ! response.metadata_token ) {
				event.source.postMessage(
					{
						event: 'videopress_token_error',
						guid,
					},
					'*'
				);
				return;
			}
			const jwt = response.metadata_token;
			event.source.postMessage(
				{
					event: 'videopress_token_received',
					guid,
					jwt,
				},
				'*'
			);
		} );
	};

	destroy() {
		window.removeEventListener( 'message', this.receiveMessage );

		if ( ! this.video ) {
			return;
		}

		// Remove DOM created outside of React.
		while ( this.video.firstChild ) {
			this.video.removeChild( this.video.firstChild );
		}
	}

	play() {
		if ( ! this.video ) {
			return;
		}

		this.video.contentWindow.postMessage(
			{ event: 'videopress_action_play' },
			'https://video.wordpress.com'
		);
	}

	pause() {
		if ( ! this.video ) {
			return;
		}

		this.video.contentWindow.postMessage(
			{ event: 'videopress_action_pause' },
			'https://video.wordpress.com'
		);
	}

	render() {
		const classes = classNames( this.props.className, 'is-video' );
		const { item } = this.props;
		const { height = 480, videopress_guid, width = 854 } = item;

		const params = {
			autoPlay: this.autoplay,
			height,
			width,
			fill: true,
		};

		const qs = Object.keys( params ).map( ( key ) => `${ key }=${ params[ key ] }` );
		const videoUrl = `https://video.wordpress.com/v/${ videopress_guid }?${ qs.join( '&' ) }`;

		return (
			<iframe title="Video" src={ videoUrl } className={ classes } ref={ this.setVideoInstance } />
		);
	}
}

export default withCurrentRoute(
	connect( ( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
		};
	} )( EditorMediaModalDetailPreviewVideoPress )
);
