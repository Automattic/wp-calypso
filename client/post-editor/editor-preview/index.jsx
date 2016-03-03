/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import url from 'url';
import defer from 'lodash/defer';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';

const EditorPreview = React.createClass( {

	_hasTouch: false,

	propTypes: {
		showPreview: React.PropTypes.bool,
		isSaving: React.PropTypes.bool,
		isLoading: React.PropTypes.bool,
		previewUrl: React.PropTypes.string,
		onClose: React.PropTypes.func,
		postId: React.PropTypes.number
	},

	getInitialState() {
		return {
			iframeUrl: 'about:blank',
		};
	},

	componentDidUpdate( prevProps ) {
		if ( this.didStartSaving( prevProps, this.props ) ) {
			this.setState( { iframeUrl: 'about:blank' } );
		}

		if ( this.props.previewUrl && (
			this.didFinishSaving( prevProps ) ||
			this.didLoad( prevProps ) ||
			this.didShowSavedPreviewViaTouch( prevProps )
		) ) {
			this.setState( { iframeUrl: this.getIframePreviewUrl() } );
		}
	},

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.keyDown );
	},

	didStartSaving( props, nextProps ) {
		if ( ! props || ! nextProps ) {
			return false;
		}

		return nextProps.isSaving && ! props.isSaving;
	},

	didFinishSaving( prevProps ) {
		return prevProps.isSaving && ! this.props.isSaving;
	},

	didLoad( prevProps ) {
		return prevProps && prevProps.isLoading && ! this.props.isLoading;
	},

	didShowSavedPreviewViaTouch( prevProps ) {
		// Find state change where preview is shown and we're not saving or loading
		return this._hasTouch &&
			! prevProps.showPreview &&
			this.props.showPreview &&
			! this.props.isSaving &&
			! this.props.isLoading;
	},

	getIframePreviewUrl() {
		const parsed = url.parse( this.props.previewUrl, true );
		parsed.query.preview = 'true';
		parsed.query.iframe = 'true';
		delete parsed.search;
		return url.format( parsed );
	},

	detectFocusLoss() {
		this.activeElement = document.activeElement;
		while ( this.activeElement && this.activeElement.contentWindow ) {
			try {
				this.activeElement = this.activeElement.contentDocument.activeElement;
			} catch ( e ) {
				break;
			}
		}
	},

	verifyFocusLoss() {
		defer( () => {
			if ( this.activeElement && document.activeElement &&
					document.activeElement !== this.activeElement &&
					ReactDom.findDOMNode( this.refs.preview ).contains( document.activeElement ) ) {
				this.activeElement.focus();
			}

			delete this.activeElement;
		} );
	},

	render() {
		return (
			<WebPreview
				ref="preview"
				showPreview={ this.props.showPreview }
				defaultViewportDevice="tablet"
				onClose={ this.props.onClose }
				onFrameUrlChange={ this.detectFocusLoss }
				onFrameLoad={ this.verifyFocusLoss }
				previewUrl={ this.state.iframeUrl }
				loadingMessage="Beep beep boop…"
			/>
		);
	}
} );

module.exports = EditorPreview;
