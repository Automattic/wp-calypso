/**
 * External dependencies
 */
import React from 'react';
import url from 'url';
import omit from 'lodash/omit';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import WebPreview from 'components/web-preview';
import WebPreviewContent from 'components/web-preview/content';

const EditorPreview = React.createClass( {

	_hasTouch: false,

	propTypes: {
		showPreview: React.PropTypes.bool,
		isSaving: React.PropTypes.bool,
		isLoading: React.PropTypes.bool,
		previewUrl: React.PropTypes.string,
		editUrl: React.PropTypes.string,
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

	cleanExternalUrl( externalUrl ) {
		if ( ! externalUrl ) {
			return null;
		}
		const parsed = url.parse( externalUrl, true );
		parsed.query = omit( parsed.query, 'preview', 'iframe', 'frame-nonce' );
		delete parsed.search;
		return url.format( parsed );
	},

	render() {
		const previewFlow = config.isEnabled( 'post-editor/delta-post-publish-preview' );
		const className = classNames( 'editor-preview', {
			'is-fullscreen': previewFlow,
		} );

		return (
			<div className={ className }>
				{ previewFlow
					? <WebPreviewContent
							showPreview={ this.props.showPreview }
							showEdit={ true }
							showExternal={ false }
							defaultViewportDevice={ this.props.defaultViewportDevice }
							onClose={ this.props.onClose }
							onEdit={ this.props.onEdit }
							previewUrl={ this.state.iframeUrl }
							editUrl={ this.props.editUrl }
						/>
					: <WebPreview
							showPreview={ this.props.showPreview }
							defaultViewportDevice={ this.props.defaultViewportDevice }
							onClose={ this.props.onClose }
							previewUrl={ this.state.iframeUrl }
							externalUrl={ this.cleanExternalUrl( this.props.externalUrl ) }
						/>
				}
			</div>
		);
	}
} );

module.exports = EditorPreview;
