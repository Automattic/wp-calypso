/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { get, keys } from 'lodash';
import classNames from 'classnames';

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

	componentDidMount() {
		window.addEventListener( 'message', this.receiveMessage, false );
	}

	componentWillUnmount() {
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
		}
	}

	shouldComponentUpdate( nextProps ) {
		if ( this.props.item.videopress_guid !== nextProps.item.videopress_guid ) {
			return true;
		}

		return false;
	}

	setVideoInstance = ( ref ) => ( this.video = ref );

	receiveMessage = ( event ) => {
		if ( event.origin && event.origin !== 'https://video.wordpress.com' ) {
			return;
		}

		const { data } = event;

		if (
			! data ||
			-1 ===
				[ 'videopress_loading_state', 'videopress_action_pause_response' ].indexOf( data.event )
		) {
			return;
		}

		if (
			'videopress_loading_state' === data.event &&
			'loaded' === get( data, 'state' ) &&
			! get( data, 'converting' )
		) {
			this.props.onVideoLoaded();
		} else if ( 'videopress_action_pause_response' === data.event ) {
			const currentTime = get( data, 'currentTime' );
			this.props.onPause( currentTime );
		}
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
		const { isPlaying, item } = this.props;
		const { height = 480, videopress_guid, width = 854 } = item;

		const params = {
			autoPlay: isPlaying,
			height,
			width,
			fill: true,
		};
		const qs = keys( params ).map( ( key ) => `${ key }=${ params[ key ] }` );
		const videoUrl = `https://video.wordpress.com/v/${ videopress_guid }?${ qs.join( '&' ) }`;

		return (
			<iframe title="Video" src={ videoUrl } className={ classes } ref={ this.setVideoInstance } />
		);
	}
}

export default EditorMediaModalDetailPreviewVideoPress;
