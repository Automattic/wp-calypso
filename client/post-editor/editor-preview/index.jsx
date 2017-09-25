/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import WebPreviewContent from 'components/web-preview/content';
import { omitUrlParams } from 'lib/url';
import url from 'url';

const EditorPreview = React.createClass( {

	_hasTouch: false,

	propTypes: {
		showPreview: PropTypes.bool,
		isSaving: PropTypes.bool,
		isLoading: PropTypes.bool,
		isFullScreen: PropTypes.bool,
		previewUrl: PropTypes.string,
		editUrl: PropTypes.string,
		onClose: PropTypes.func,
		postId: PropTypes.number,
		revision: PropTypes.number,
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
		parsed.query.revision = String( this.props.revision );
		delete parsed.search;
		return url.format( parsed );
	},

	cleanExternalUrl( externalUrl ) {
		return omitUrlParams( externalUrl, [ 'iframe', 'frame-nonce' ] );
	},

	render() {
		const isFullScreen = this.props.isFullScreen;
		const className = classNames( 'editor-preview', {
			'is-fullscreen': isFullScreen,
		} );

		return (
			<div className={ className }>
				{ isFullScreen
					? <WebPreviewContent
							showPreview={ this.props.showPreview }
							showEdit={ true }
							showExternal={ true }
							showUrl={ true }
							defaultViewportDevice={ this.props.defaultViewportDevice }
							onClose={ this.props.onClose }
							onEdit={ this.props.onEdit }
							previewUrl={ this.state.iframeUrl }
							editUrl={ this.props.editUrl }
							externalUrl={ this.cleanExternalUrl( this.props.externalUrl ) }
							loadingMessage={
								this.props.translate( '{{strong}}One moment, please…{{/strong}} loading your new post.',
									{ components: { strong: <strong /> } }
								)
							}
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

export default localize( EditorPreview );
