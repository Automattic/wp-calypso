/* eslint-disable react/no-string-refs */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { pick } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ResizableIframe from 'components/resizable-iframe';
import getEmbed from 'state/selectors/get-embed';
import generateEmbedFrameMarkup from 'lib/embed-frame-markup';

class EmbedView extends Component {
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

	componentDidUpdate( prevProps ) {
		if ( this.props.embed?.body !== prevProps.embed?.body ) {
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
		if ( ! this.props.embed?.body || ! this.refs.iframe ) {
			return;
		}

		const iframe = ReactDom.findDOMNode( this.refs.iframe );
		if ( ! iframe.contentDocument ) {
			return;
		}

		const markup = generateEmbedFrameMarkup(
			pick( this.props.embed, 'body', 'scripts', 'styles' )
		);
		iframe.contentDocument.open();
		iframe.contentDocument.write( markup );
		iframe.contentDocument.body.style.width = '100%';
		iframe.contentDocument.body.style.overflow = 'hidden';
		iframe.contentDocument.close();
	}

	renderFrame() {
		if ( ! this.state?.wrapper || ! this.props.embed ) {
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

export default connect( ( state, { content, siteId } ) => ( {
	embed: getEmbed( state, siteId, content ),
} ) )( EmbedView );
