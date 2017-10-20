/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { assign, debounce } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import EmbedContainer from 'components/embed-container';
import FormTextInput from 'components/forms/form-text-input';
import wpcom from 'lib/wp';
import { getSelectedSiteId } from 'state/ui/selectors';
import Spinner from 'components/spinner';

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
	};

	state = {
		embedUrl: this.props.embedUrl,
		previewUrl: this.props.embedUrl,
		// might be simpler to get rid of previewUrl and just use embedUrl
		// but i think that'd introduce extra unnecessary render() calls
		// might not to revisit that now that using previewMarkup, though
		previewMarkup: [],
	};

	componentWillMount() {
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
		this.debouncedUpdateEmbedPreview = debounce( function() {
			this.setState( { previewUrl: this.state.embedUrl } );

			// todo should probably add an animated loading block so the user gets some visual feedback while they wait for the new embed to load

			// Use cached data if it's available
			if ( this.state.previewMarkup[ this.state.embedUrl ] ) {
				return;
			}

			this.setState( { isLoading: true } );

			// Fetch fresh data from the API
			wpcom
				.undocumented()
				.site( this.props.siteId )
				.embeds( { embed_url: this.state.embedUrl }, ( error, data ) => {
					const { previewMarkup, embedUrl } = this.state;

					this.setState( { isLoading: false } );

					let cachedMarkup;

					if ( data && data.result ) {
						cachedMarkup = data.result;
						// todo need to do more to check that data.result is valid before using it?
					} else {
						console.log( 'lookup error:', error );
						// todo add details? or just generic error message

						cachedMarkup = 'error foo';

						// todo handle errors
						// xhr errors in `error` var
						// and also application layer errors in `data.error` or however wpcom.js signals a error to the caller
						// add unit tests for those. mock the xhr

						// todo show an error in the preview box if fetching the embed failed / it's an invalid URL
						// right now it just continues showing the last valid preview
						// don't wanna do if they're still typing though. debounce might be enough to fix that, but still could be annoying.
						// need to play with
						// how to detect from the markup if it was an error? it'll be dependent on the service etc, right? or maybe wpcom.js normalizes it into a standard error format?
					}

					this.setState( {
						// SECURITY WARNING: The value of previewMarkup is later used with
						// dangerouslySetInnerHtml, so it must never be changed to include
						// untrusted data.
						previewMarkup: assign( previewMarkup, { [ embedUrl ]: cachedMarkup } ),
						// todo merge() or other function would be better than assign() ^^^?
					} );
				} );
		}, 500 );
		// todo this doesn't need to be inside compwillmount? it can just be regular function below?
		// that'd be cleaner and more consistent, but i was thinking it had to be declared in here for some reason. not sure about that anymore.

		// Prepare the initial markup before the first render()
		this.debouncedUpdateEmbedPreview();
		// todo should probably call flush() so it runs immediately instead of debouncing for 500ms
		// todo would this be more appropriate somewhere later in the lifecycle?
	}

	/**
	 * Reset some of the state whenever the component's dialog is opened or closed.
	 *
	 * If this were not done, then switching back and forth between multiple embeds would result in
	 * the previous URL being displayed in the input field and preview. For example, when the second
	 * embed was opened, `state.previewUrl` would equal the value of the first embed, since it
	 * initially set the state.
	 *
	 * @param {object} nextProps The properties that will be received.
	 */
	componentWillReceiveProps = nextProps => {
		this.setState(
			{
				embedUrl: nextProps.embedUrl,
				previewUrl: nextProps.embedUrl,
			},
			() => {
				// Refresh the preview
				this.debouncedUpdateEmbedPreview();
				// todo should probably call immediately w/ .flush() instead of waiting for debounce
				// todo maybe pass new value directly instead of waiting for setstate to completely asyncronously?
				// todo should probably only call if props.isvisible? otherwise calling when closing the dialog, which is wasteful and unnecessary
			}
		);

		// todo this whole flow is getting a little complicated.
		// state is updated here, and also updated in the debounced function, and maybe other places.
		// and the functions are dependent on whether or not the state has been updated, etc.
		// try to simplify everything
	};

	onChangeEmbedUrl = event => {
		this.setState( { embedUrl: event.target.value }, () => {
			this.debouncedUpdateEmbedPreview();
			// todo i think this should wait until state is updated, b/c debounced function expected this.state.embedurl to have been updated when its called
			// it seems to work being called immediately, but that could just be b/c fast enough to usually win race condition?
			// alternate might be to pass the new url as param, instead of waiting. that might be better
		} );

		// todo when you click Update, the focus is jumping back to the start of the editor, instead of the position it was in before opening the dialog
		// doesn't happen when click Cancel, though
		// might not be impactful enough to spend time fixing
		// might be easy to fix with wpcom-view::select() or editor.selection.set() or something, though
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

	render() {
		const { translate } = this.props;
		const dialogButtons = [
			<Button onClick={ this.props.onCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.onUpdate }>
				{ translate( 'Update' ) }
			</Button>,
		];

		return (
			<Dialog
				autoFocus={ false }
				buttons={ dialogButtons }
				additionalClassNames="embed__modal"
				isVisible={ this.props.isVisible }
				onCancel={ this.props.onCancel }
				onClose={ this.props.onCancel }
			>
				<h3 className="embed__title">{ translate( 'Embed URL' ) }</h3>

				<FormTextInput
					autoFocus={ true }
					className="embed__url"
					defaultValue={ this.state.embedUrl }
					onChange={ this.onChangeEmbedUrl }
					onKeyDown={ this.onKeyDownEmbedUrl }
				/>

				{ this.state.isLoading && (
					<div className="embed__loading">
						<Spinner className="embed__loading-spinner" size={ 20 } />
					</div>
				) }

				{ /* todo another approach would be to use an iframe instead of a div
				<iframe className="embed__preview" srcDoc={ this.state.previewMarkup[ this.state.previewUrl ] } />

				that feels a bit safer because we can sandbox it to improve security, but maybe it's not needed because the markup
				returned by the api is always trusted? i think it is, but need to verify

				using an iframe seems to work, but is probably redundant since the API markup always returns things in an iframe anyway?
				not 100% sure it always does, though
				if use iframe, add sandbox attribute and disable everything except `allow-scripts`?

				need to use ResizeableIframe to deal w/ unknown dimensions of various embeds?
				maybe try again to just use EmbedView, even if you have to modify it to accept a url prop or something
					use it directly, though, don't mess with EmbedViewManager
				*/ }

				{ /* This is safe because previewMarkup comes from our API endpoint */ }
				{ /* are you sure that makes it safe? get security review */ }

				{ ! this.state.isLoading &&
				this.state.previewMarkup[ this.state.previewUrl ] && (
					<EmbedContainer>
						<div
							className="embed__preview"
							dangerouslySetInnerHTML={ {
								__html: this.state.previewMarkup[ this.state.previewUrl ],
							} }
						/>
					</EmbedContainer>
				) }
			</Dialog>
		);

		{
			/* todo

			test various embed services, both whitelisted and generic oembed
				not embedding correctly in editor, before preview, but maybe these aren't supposed to be handled by wpcom-view/embed?
					shortcodes: vr, archiveorg, twitch
					oembed: eventbrite, bandcamp,

			bug: open the dialog, everything looks good. then click cancel button, then open it again. now it doesn't render at all.
				only happens with some services, like pinterest & fb, maybe others from embedcotainer?
				might need to EmbedContainer::embedPinterest() detect if already loaded and return early, or could need something totally different.

			bug: open the dialog, the input field has the focus. click outside the field (but still within modal), input loses focus. that's all normal.
				now, try to click back into the field (but not on the text itself, just the whitespace). it won't focus
				sometimes it won't focus when clicking on the text either, or have to click several times.

			chrome console warning: "Refused to display 'https://www.facebook.com/xti.php?xt=AZW4yx3ElFj8wS2zZ0awYZYeCHQX9GKfcaP5HUVhjVUJe2rhI0dScOBaE4IALljF-1-71pVsHv4FYfcrV6ozzCPdIBMFedrUFTypnEMwzlYEJ9YvnQhpZG4rWmmMFM2YjhtMLSx-PiBt9vIW1iFuPVuadBkqQffHDRynmqZNDMSykA&isv=1&cts=1508425830&csp' in a frame because it set 'X-Frame-Options' to 'sameorigin'."
				it happens intermittently, though, and the embed still works, so not sure if it's an issue

		*/
		}
	}
}

const connectedEmbedDialog = connect( ( state, { siteId } ) => {
	return {
		siteId: siteId ? siteId : getSelectedSiteId( state ),
	};
} )( EmbedDialog );

export default localize( connectedEmbedDialog );
// todo should localize() and then connect()? for consistency in dev tools element tree?
// the code reads cleaning having it this way, though, since localize() is concise enough to fit in the export statement,
// but connect() needs several lines and extra logic, so it's nicer to have it as a separate piece
