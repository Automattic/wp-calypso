/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { upgradeElement } from '@ampproject/worker-dom/dist/main.mjs';

/**
 * TODO:
 * i18n
 * ...
 */
class RemoteBlock extends React.Component {
	static propTypes = {
		siteURL: PropTypes.string.isRequired,
		componentSlug: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );
		this.remoteBlockRef = React.createRef();
	}

	// shouldComponentUpdate( nextProps, nextState ) {
	// 	return nextProps.src !== this.props.src;
	// }

	componentDidMount() {
		var targetNode = this.remoteBlockRef.current;

		// add a shadow DOM and necessary child elements
		const appContainer = this.createShadowDOM( targetNode );

		// use workerdom to load and execute the remote worker
		upgradeElement( appContainer, '/calypso/workerdom/worker.mjs' );
	}

	createStyle( content ) {
		var el = document.createElement( 'style' );
		el.type = 'text/css';
		if ( el.styleSheet ) {
		  el.styleSheet.cssText = content;
		} else {
		  el.appendChild( document.createTextNode( content ) );
		}

		return el;
	  }

	createRemoteStyle( url ) {
		return this.createStyle( '@import "' + encodeURI( url ) + '";' );
	}

	createMeta( name, content ) {
		var el = document.createElement( 'meta' );
		el.setAttribute( 'name', name );
		el.content = content;
		return el;
	}

	createWpAdminWrapper() {
		// a lot of common.css styles are scoped to <body> so we need to include a body wrapper that is in
		// scope of the Shadow DOM
		var el = document.createElement( 'body' );
		return el;
	}

	createShadowDOM( el ) {
		const apiRoot = this.props.siteURL + '/wp-json';
		// the client can actually be loaded from any domain, e.g. 
		// const src = 'http://anotherdomain.local/wp-json/jetpack/v4/universal-client/performance.js';
		const src = apiRoot + '/jetpack/v4/universal-client/' + this.props.componentSlug + '.js';

		const shadow = el.attachShadow({mode: 'open'});
		const wrapper = this.createWpAdminWrapper();
		const appContainer = document.createElement( 'div' );
		appContainer.setAttribute( 'src', src );
		appContainer.appendChild( this.createStyle( ':host { all: initial; }' ) ); // reset some styles that flow through appContainer dom boundary - font-family, background-color, etc

		// TODO: load these based on metadata about the remote component
		appContainer.appendChild( this.createRemoteStyle( 'https://c0.wp.com/c/5.2.2/wp-admin/css/common.css' ) );
		appContainer.appendChild( this.createRemoteStyle( this.props.siteURL + '/wp-content/plugins/jetpack/_inc/build/admin.css' ) );
		appContainer.appendChild( this.createRemoteStyle( this.props.siteURL + '/wp-content/plugins/jetpack/_inc/build/style.min.css' ) );

		// TODO: make these credentials dynamic, and also based on metadata about the remote component
		appContainer.appendChild( this.createMeta( "authorization-credentials", "fill-me-in" ) );
		appContainer.appendChild( this.createMeta( "authorization-type", "Basic" ) );
		appContainer.appendChild( this.createMeta( "wp-api-url", apiRoot ) );
		shadow.appendChild( wrapper );
		wrapper.appendChild( appContainer );
		return appContainer;
	}

	render() {
		return (
			<div ref={ this.remoteBlockRef }></div>
		);
	}
}

export default RemoteBlock;