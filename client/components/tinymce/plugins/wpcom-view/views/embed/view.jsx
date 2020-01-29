/* eslint-disable react/no-string-refs */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Container } from 'flux/utils';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import ResizableIframe from 'components/resizable-iframe';
import EmbedsStore from 'lib/embeds/store';
import generateEmbedFrameMarkup from 'lib/embed-frame-markup';

class EmbedView extends Component {
	static getStores() {
		return [ EmbedsStore ];
	}

	static calculateState( state, props ) {
		return EmbedsStore.get( props.content );
	}

	componentDidMount() {
		// Rendering the frame follows a specific set of steps, whereby an
		// initial rendering pass is made, at which time the frame is rendered
		// in a second pass, before finally setting the frame markup.
		//
		// TODO: Investigate and evaluate whether we need to avoid rendering
		//       the iframe on the initial render pass
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState(
			{
				// eslint-disable-line react/no-did-mount-set-state
				wrapper: this.refs.view,
			},
			this.setHtml
		);
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( this.state.body !== prevState.body ) {
			this.setHtml();
		}

		this.constrainEmbedDimensions();
	}

	constrainEmbedDimensions() {
		if ( ! this.refs.iframe ) {
			return;
		}

		const view = ReactDom.findDOMNode( this.refs.view );
		const iframe = ReactDom.findDOMNode( this.refs.iframe );
		if ( ! iframe.contentDocument ) {
			return;
		}

		const embed = iframe.contentDocument.querySelector( 'iframe' );

		if ( ! embed || ! embed.width ) {
			return;
		}

		const width = parseInt( embed.width, 10 );
		if ( width <= view.clientWidth ) {
			return;
		}
		embed.style.width = view.clientWidth + 'px';

		if ( embed.height ) {
			const proportion = parseInt( embed.height, 10 ) / width;
			embed.style.height = Math.round( view.clientWidth * proportion ) + 'px';
		}
	}

	setHtml() {
		if ( ! this.state.body || ! this.refs.iframe ) {
			return;
		}

		const iframe = ReactDom.findDOMNode( this.refs.iframe );
		if ( ! iframe.contentDocument ) {
			return;
		}

		const markup = generateEmbedFrameMarkup( pick( this.state, 'body', 'scripts', 'styles' ) );
		iframe.contentDocument.open();
		iframe.contentDocument.write( markup );
		iframe.contentDocument.body.style.width = '100%';
		iframe.contentDocument.body.style.overflow = 'hidden';
		iframe.contentDocument.close();
	}

	renderFrame() {
		if ( ! this.state.wrapper ) {
			return;
		}

		return (
			<ResizableIframe
				ref="iframe"
				onResize={ this.props.onResize }
				frameBorder="0"
				seamless
				width="100%"
			/>
		);
	}

	render() {
		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div ref="view" className="wpview-content wpview-type-embed">
				{ this.renderFrame() }
			</div>
		);
	}
}

EmbedView.propTypes = {
	siteId: PropTypes.number,
	content: PropTypes.string,
	onResize: PropTypes.func,
};

EmbedView.defaultProps = {
	onResize: () => {},
};

// Flux does not handle untranspiled ES6 properly (see https://github.com/facebook/flux/issues/351).
// As such, we need to work around the issue by uglily wrapping the component, to ensure that it
// works both in the evergreen and fallback builds.
// The long-term fix is to move this component away from using Flux.
function wrapComponent( containerClass ) {
	const Tmp = containerClass;
	containerClass = function( ...args ) {
		return new Tmp( ...args );
	};
	containerClass.prototype = Tmp.prototype;
	containerClass.getStores = Tmp.getStores;
	containerClass.calculateState = Tmp.calculateState;
	return containerClass;
}

const EmbedViewContainer = Container.create( wrapComponent( EmbedView ), { withProps: true } );
export default EmbedViewContainer;
