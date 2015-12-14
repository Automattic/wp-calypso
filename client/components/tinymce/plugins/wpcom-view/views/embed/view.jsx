/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { Container } from 'flux/utils';

/**
 * Internal dependencies
 */
import ResizableIframe from 'components/resizable-iframe';
import EmbedsStore from 'lib/embeds/store';
import actions from 'lib/embeds/actions';

class EmbedView extends Component {
	static getStores() {
		return [ EmbedsStore ];
	}

	static calculateState( state, props ) {
		return EmbedsStore.get( props.content );
	}

	componentDidMount() {
		if ( ! this.state.status || this.state.status === 'ERROR' ) {
			setTimeout( () => actions.fetch( this.props.siteId, this.props.content ), 0 );
		}

		this.setState( {
			wrapper: this.refs.view
		}, this.setHtml );
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

		iframe.contentDocument.open();
		iframe.contentDocument.write( this.state.body );
		iframe.contentDocument.body.style.margin = 0;
		iframe.contentDocument.body.style.width = '100%';
		iframe.contentDocument.body.style.overflow = 'hidden';
		iframe.contentDocument.close();
	}

	renderFrame() {
		if ( ! this.state.wrapper ) {
			return;
		}

		return <ResizableIframe ref="iframe" onResize={ this.props.onResize } frameBorder="0" seamless width="100%" />;
	}

	render() {
		return (
			<div ref="view" className="wpview-content wpview-type-embed">
				{ this.renderFrame() }
			</div>
		);
	}

}

EmbedView.propTypes = {
	siteId: PropTypes.number,
	content: PropTypes.string,
	onResize: PropTypes.func
};

EmbedView.defaultProps = {
	onResize: () => {}
};

const EmbedViewContainer = Container.create( EmbedView, { withProps: true } );
export default EmbedViewContainer;
