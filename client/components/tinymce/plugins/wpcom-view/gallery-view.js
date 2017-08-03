/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependecies
 */
import shortcodeUtils from 'lib/shortcode';
import GalleryShortcode from 'components/gallery-shortcode';

class GalleryView extends Component {

	static match( content ) {
		const nextMatch = shortcodeUtils.next( 'gallery', content );

		if ( nextMatch ) {
			return {
				index: nextMatch.index,
				content: nextMatch.content,
				options: {
					shortcode: nextMatch.shortcode
				}
			};
		}
	}

	static serialize( content ) {
		return encodeURIComponent( content );
	}

	static edit( editor, content ) {
		editor.execCommand( 'wpcomEditGallery', content );
	}

	constructor( props ) {
		super( props );

		this.state = {
			wrapper: null
		};
	}

	componentDidMount() {
		this.setState( {
			wrapper: ReactDom.findDOMNode( this.refs.view )
		} );

		if ( window.MutationObserver ) {
			this.observer = new MutationObserver( this.props.onResize );
			this.observer.observe( ReactDom.findDOMNode( this.refs.view ), {
				attributes: true,
				childList: true,
				subtree: true
			} );
		}
	}

	componentWillUnmount() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
	}

	renderShortcode() {
		if ( ! this.state.wrapper ) {
			return;
		}

		return (
			<GalleryShortcode siteId={ this.props.siteId } width={ this.state.wrapper.clientWidth }>
				{ this.props.content }
			</GalleryShortcode>
		);
	}

	render() {
		return (
			<div ref="view" className="wpview-content wpview-type-gallery">
				{ this.renderShortcode() }
			</div>
		);
	}

}

GalleryView.propTypes = {
	siteId: PropTypes.number,
	content: PropTypes.string,
	onResize: PropTypes.func
};

GalleryView.defaultProps = {
	onResize: () => {}
};

export default GalleryView;
