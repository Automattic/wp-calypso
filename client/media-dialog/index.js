/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */


const sendMessage = message => {
	if ( ! window || ! window.parent ) {
		return;
	}

	window.parent.postMessage( JSON.stringify( { ...message, type: 'gutenbergIframeMessage' } ), '*' );
};

class MediaDialog extends Component {
	componentDidMount() {
		window.addEventListener( 'message', this.onMessage, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessage, false );
	}

	openModal = () => {
		const { gallery, multiple, allowedTypes } = this.props;
		sendMessage( { action: 'openModal', payload: { gallery, multiple, allowedTypes } } );
	}

	onMessage = ( { data } ) => {
		if ( typeof data !== 'string' || data[ 0 ] !== '{' ) {
			return;
		}
		const message = JSON.parse( data );

		const { type, action, payload } = message;
		if( type !== 'gutenbergIframeMessage' ) {
			return;
		}

		if( action === 'selectMedia' && payload) {
			this.props.onSelect( payload );
		}
	}

	render() {
		return this.props.render( { open: this.openModal } );
	}
}

wp.hooks.addFilter(
	'editor.MediaUpload',
	'core/edit-post/components/media-upload/replace-media-upload',
	() => MediaDialog
);
