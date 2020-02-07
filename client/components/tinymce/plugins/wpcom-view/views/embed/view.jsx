/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React, { Component, createRef } from 'react';
import { pick } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import generateEmbedFrameMarkup from 'lib/embed-frame-markup';
import getEmbed from 'state/selectors/get-embed';
import QueryEmbed from 'components/data/query-embed';
import ResizableIframe from 'components/resizable-iframe';

class EmbedView extends Component {
	view = createRef();

	iframe = createRef();

	componentDidMount() {
		this.setHtml();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.embed?.body !== prevProps.embed?.body ) {
			this.setHtml();
		}

		this.constrainEmbedDimensions();
	}

	constrainEmbedDimensions() {
		if ( ! this.iframe ) {
			return;
		}

		const view = this.view.current;
		const iframe = ReactDom.findDOMNode( this.iframe.current );
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
		if ( ! this.props.embed?.body || ! this.iframe ) {
			return;
		}

		const iframe = ReactDom.findDOMNode( this.iframe.current );
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
		if ( ! this.props.embed ) {
			return;
		}

		return (
			<ResizableIframe
				ref={ this.iframe }
				onResize={ this.props.onResize }
				frameBorder="0"
				seamless
				width="100%"
			/>
		);
	}

	render() {
		const { content, siteId } = this.props;

		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div ref={ this.view } className="wpview-content wpview-type-embed">
				<QueryEmbed siteId={ siteId } url={ content } />

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
