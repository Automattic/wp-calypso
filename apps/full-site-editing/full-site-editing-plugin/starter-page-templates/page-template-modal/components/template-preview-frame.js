/**
 * External dependencies
 */
import { each, filter } from 'lodash';
import ReactDOM from 'react-dom';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { Component } from '@wordpress/element';

class TemplatePreviewFrame extends Component {
	componentDidMount() {
		this.iframeHead = this.node.contentDocument.head;
		this.iframeBody = this.node.contentDocument.body;

		this.initStyles();
		this.height = '100%';
		this.forceUpdate();
	}

	componentDidUpdate() {
		this.height = this.iframeBody.scrollHeight + 'px';
	}

	initStyles() {
		// Populate styles to iframe element.
		each(
			filter(
				document.querySelectorAll( 'head link' ),
				( { rel, href } ) => rel && rel === 'stylesheet' && href.match( /wp-content/ ) // only move styles from wp-content
			),
			( { href } ) => {
				const iframeLink = document.createElement( 'link' );
				iframeLink.rel = 'stylesheet';
				iframeLink.type = 'text/css';
				iframeLink.href = href;
				this.iframeHead.appendChild( iframeLink );
			}
		);

		each( filter( document.querySelectorAll( 'head style' ) ), ( { innerHTML } ) => {
			const iframeHeadStyle = document.createElement( 'style' );
			iframeHeadStyle.innerHTML = innerHTML;
			this.iframeHead.appendChild( iframeHeadStyle );
		} );

		each( filter( document.querySelectorAll( 'body style' ) ), ( { innerHTML } ) => {
			const iframeStyle = document.createElement( 'style' );
			iframeStyle.innerHTML = innerHTML;
			this.iframeBody.appendChild( iframeStyle );
		} );
	}

	render() {
		const { children, head } = this.props;
		/* eslint-disable jsx-a11y/iframe-has-title */
		return (
			<iframe
				ref={ node => ( this.node = node ) }
				style={ { width: '100%', height: this.height } }
				id="iframe-page-template-preview"
				class="block-preview-iframe"
			>
				{ this.iframeHead && ReactDOM.createPortal( head, this.iframeHead ) }
				{ this.iframeBody && ReactDOM.createPortal( children, this.iframeBody ) }
			</iframe>
		);
		/* eslint-ensable jsx-a11y/iframe-has-title */
	}
}

export default TemplatePreviewFrame;
