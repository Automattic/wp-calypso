/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';
import { debounce, pick } from 'lodash';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormTextInput from 'components/forms/form-text-input';
import wpcom from 'lib/wp';
import { getSelectedSiteId } from 'state/ui/selectors';
import Spinner from 'components/spinner';
import generateEmbedFrameMarkup from 'lib/embed-frame-markup';
import ResizableIframe from 'components/resizable-iframe';

/*
 * Shows the URL and preview of an embed, and allows it to be edited.
 */
export class EmbedDialog extends React.Component {
	static propTypes = {
		embedUrl: PropTypes.string,
		isVisible: PropTypes.bool,

		// Event handlers
		onCancel: PropTypes.func.isRequired,
		onUpdate: PropTypes.func.isRequired,

		// Inherited
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		embedUrl: '',
		isVisible: false,
		isLoading: false,
	};

	state = {
		embedUrl: this.props.embedUrl,
		previewMarkup: [],
	};

	componentWillMount() {
		/**
		 * Reset the state to the default state
		 */
		this.setState( {
			embedUrl: this.props.embedUrl,
		} );

		/**
		 * Prepare the markup for the new embed URL
		 *
		 * @todo: Making an API request directly is a bit of a hack. The ideal solution would be to
		 *        reuse EmbedViewManager and EmbedView, but that leads to a messy complications. When
		 *        pasting a new URL into the input field, all instances of wpcom-views/embed on the
		 *        screen would be refreshed, causing TinyMCE's selection to be unset. Because of that,
		 *        the new URL would be inserted at the beginning of the editor body, rather than
		 *        replacing the old URL. Troubleshooting proved to be very difficult.
		 *        See `p1507898606000351-slack-delta-samus` for more details.
		 */
		this.debouncedFetchEmbedPreviewMarkup = debounce( this.fetchEmbedPreviewMarkup, 500 );

		if ( ! this.isURLInCache( this.state.embedUrl ) ) {
			this.setState( { isLoading: true } );

			// There is no need to use the debounced function here, since this action is not based on user input
			this.fetchEmbedPreviewMarkup( this.state.embedUrl );
		}
	}

	componentWillReceiveProps = newProps => {
		if ( this.state.embedUrl !== newProps.embedUrl ) {
			this.setState( {
				embedUrl: newProps.embedUrl,
			} );
		}
	};

	componentDidUpdate = ( prevProps, prevState ) => {
		// New URL typed, fetch it from the API
		if ( this.state.embedUrl !== prevState.embedUrl ) {
			if ( ! this.isURLInCache( this.state.embedUrl ) ) {
				this.setState( { isLoading: true } );
				this.debouncedFetchEmbedPreviewMarkup( this.state.embedUrl );
				return;
			}

			// Update the iframe HTML
			this.setHtml();
		}
	};

	isURLInCache = url => {
		return !! this.state.previewMarkup[ url ];
	};

	parseEmbedEndpointResult = url => ( error, data, headers ) => {
		let cachedMarkup;

		if ( data && data.result ) {
			cachedMarkup = data;
		} else {
			if ( headers && headers.status === 0 ) {
				error = {
					error: 'communication_error',
					message: this.props.translate( 'Connection issue. Please reload the page and try again' ),
				};
			} else if ( error && ! error.message ) {
				error.message = this.props.translate( 'Unknown error' );
			} else if ( data && data.error ) {
				error = data.error;
			}

			cachedMarkup = {
				renderMarkup: error,
				isError: true,
			};
		}

		this.setState( {
			isLoading: false,
			previewMarkup: {
				...this.state.previewMarkup,
				[ url ]: cachedMarkup,
			},
		} );
	};

	fetchEmbedPreviewMarkup = url => {
		// Use cached data if it's available
		if ( this.isURLInCache( url ) || url.trim() === '' ) {
			this.setState( { isLoading: false } );
			return;
		}

		// Fetch fresh data from the API
		wpcom
			.undocumented()
			.site( this.props.siteId )
			.embeds( { embed_url: url }, this.parseEmbedEndpointResult( url ) );
	};

	onChangeEmbedUrl = event => {
		this.setState( { embedUrl: event.target.value } );
	};

	onUpdate = () => {
		this.props.onUpdate( this.state.embedUrl );
	};

	onKeyDownEmbedUrl = event => {
		if ( 'Enter' !== event.key ) {
			return;
		}

		event.preventDefault();
		this.onUpdate();
	};

	getError = errorObj => {
		switch ( errorObj.error ) {
			case 'invalid_embed_url':
				return this.props.translate( 'The Embed URL parameter must be a valid URL.' );
			default:
				return errorObj.message;
		}
	};

	constrainEmbedDimensions() {
		if ( ! this.iframe || ! this.viewref ) {
			return;
		}

		const view = ReactDom.findDOMNode( this.viewref );
		const iframe = ReactDom.findDOMNode( this.iframe );
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
		const embedURL = this.state.embedUrl;
		if ( ! this.iframe || ! this.isURLInCache( embedURL ) ) {
			return;
		}

		const embedData = this.state.previewMarkup[ embedURL ];

		if ( embedData.isError ) {
			return;
		}

		const iframe = ReactDom.findDOMNode( this.iframe );

		iframe.removeAttribute( 'sandbox' );

		if ( ! iframe.contentDocument ) {
			return;
		}

		this.setState( { iframeLoading: true } );

		const content = pick( embedData, [ 'result', 'scripts', 'styles' ] );

		content.body = content.result; // generateEmbedFrameMarkup required `body`, which in this call is named `result`

		const markup = generateEmbedFrameMarkup( content );
		iframe.contentDocument.open();
		iframe.contentDocument.write( markup );
		iframe.contentDocument.body.style.width = '100%';
		iframe.contentDocument.body.style.overflow = 'hidden';
		iframe.contentDocument.close();

		iframe.setAttribute( 'sandbox', 'allow-scripts' );

		this.constrainEmbedDimensions();
	}

	iframeOnLoad = () => {
		this.setState( { iframeLoading: false } );
	};

	handleIframeRef = iframe => {
		this.iframe = iframe;
		this.setHtml();
	};

	handleViewRef = view => {
		this.viewref = view;
	};

	render() {
		const { translate } = this.props;
		const dialogButtons = [
			<Button onClick={ this.props.onCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.onUpdate }>
				{ translate( 'Update' ) }
			</Button>,
		];

		const isLoading = this.state.isLoading || this.state.iframeLoading;
		const isURLInCache = this.isURLInCache( this.state.embedUrl );
		const cachedMarkup = isURLInCache ? this.state.previewMarkup[ this.state.embedUrl ] : null;
		const isError = cachedMarkup && cachedMarkup.isError;

		const statusClassNames = classNames( 'embed__status', {
			isError,
			isLoading,
		} );

		const previewBlockClassNames = classNames( 'embed__preview', {
			isLoading: this.state.iframeLoading,
		} );

		return (
			<Dialog
				autoFocus={ false }
				buttons={ dialogButtons }
				additionalClassNames="embed__modal"
				isVisible={ this.props.isVisible }
				onCancel={ this.props.onCancel }
				onClose={ this.props.onCancel }
			>
				<div className="embed__header">
					<h3 className="embed__title">{ translate( 'Embed URL' ) }</h3>

					<FormTextInput
						autoFocus={ true }
						className="embed__url"
						defaultValue={ this.props.embedUrl }
						onChange={ this.onChangeEmbedUrl }
						onKeyDown={ this.onKeyDownEmbedUrl }
					/>
				</div>
				<div className="embed__preview-container">
					{ ( isLoading || isError ) && (
						<div className={ statusClassNames }>
							{ isLoading && <Spinner /> }
							{ isError && (
								<div className="embed__status-error">
									{ this.getError( cachedMarkup.renderMarkup ) }
								</div>
							) }
						</div>
					) }

					{ ! this.state.isLoading &&
						cachedMarkup &&
						! isError && (
							<div ref={ this.handleViewRef } className={ previewBlockClassNames }>
								<ResizableIframe
									ref={ this.handleIframeRef }
									onResize={ this.props.onResize }
									onLoad={ this.iframeOnLoad }
									frameBorder="0"
									seamless
									width="100%"
								/>
							</div>
						) }
				</div>
			</Dialog>
		);
	}
}

const connectedEmbedDialog = connect( ( state, { siteId } ) => {
	return {
		siteId: siteId ? siteId : getSelectedSiteId( state ),
	};
} )( EmbedDialog );

export default localize( connectedEmbedDialog );
