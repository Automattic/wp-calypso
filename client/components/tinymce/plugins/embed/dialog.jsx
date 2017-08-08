/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import EmbedViewManager from 'components/tinymce/plugins/wpcom-view/views/embed'
import FormTextInput from 'components/forms/form-text-input';
import { getSelectedSiteId } from 'state/ui/selectors';

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
		// might be nice if don't need a second field here, but i think it's introduce extra unnecessary render() calls if only used props.embedUrl
	};

	constructor( props ) {
		super( ...arguments );

		this.embedViewManager = new EmbedViewManager();
		// maybe instead of creating a new manager, we should reuse the existing one?
		// but how would that change anything? because the first one is still going to have registered its listeners etc
		this.embedViewManager.updateSite( this.props.siteId );
		this.embedView = this.embedViewManager.getComponent();
	}

	componentWillMount() {
		this.debouncedUpdateEmbedPreview = debounce( function() {
			this.embedViewManager.fetchEmbed( this.state.embedUrl );
			// todo this causes the tinymce selection to be unset,
			// which leads to the new embed url being inserted at the begining of the editor instead of replacing the old embed url

			// ok, yeah, that's what's happening. when enter new url (before clicking update), it fetches the new embed,
			// calls setmarkers(), BeforeSetContent handler, removeview() (and others in between)
			// that happens for all the views on the page, not just the one in the modal that we want to update
			// then they all get re-created, but the selection isn't restored to the new view in the modal, so it's falsy when we try to insert the new url
			// and tinymce just sticks it at the begining

			// we don't want all the views to be updated, b/c it causes a flash that the user sees.
			// only want the view inside the modal updated
			// if can make that happen, then that might avoid unsetting the selection too
			// or at least it gets you closer to that point

			// it might be ok that the view gets deselected, as long as its reselected later on - is that was `toSelect` is for?
			// but maybe want to prevent it from getting deselected in the first place
			// is it updating all of them b/c it emits a 'change' event that they're all subscribed to, or something else?
			// try to narrow down exactly what triggers it

			// could try to save a copy of this.props.editor.selection.getNode() before calling fetchEmbed, then
			// restore it after, but that's not really addressing the real problem.
			// also might not work b/c original node gets deleted during changes? might need to wait until fetchEmbed finished async process too


			this.setState( { previewUrl: this.state.embedUrl } );
				// maybe wait until fetchEmbed finishes to update the previewurl?
				// test w/ throttled network connection to see if introduces race conditions

			// show an error in the preview box if fetching the embed failed / it's an invalid URL
				// right now it just continues showing the last valid preview
				// don't wanna do if they're still typing though. debounce might be enough to fix that, but still could be annoying.
				// need to play with

			// maybe add a animated loading block so the user gets some visual feedback while they wait for the new embed to load
				// throttle connection to see how bad/long it takes
		}, 500 );

		// this doesn't need to be inside compwillmount? can just be regular function below?
	}

	/**
	 * Reset `state.embedUrl` whenever the component's dialog is opened or closed.
	 *
	 * If this were not done, then switching back and forth between multiple embeds would result in
	 * `state.embedUrl` being incorrect. For example, when the second embed was opened,
	 * `state.embedUrl` would equal the value of the first embed, since it initially set the
	 * state.
	 *
	 * @param {object} nextProps The properties that will be received.
	 */
	componentWillReceiveProps = nextProps => {
		this.setState( {
			embedUrl: nextProps.embedUrl,
		} );
	};

	onChangeEmbedUrl = event => {
		this.setState( { embedUrl: event.target.value }, () => {
			this.debouncedUpdateEmbedPreview();
			// i think this should wait until state is updated, b/c debounced function expected this.state.embedurl to have been updated when its called
			// it seems to work being called immediately, but that could just be b/c fast enough to usually win race condition?
			// alternate might be to pass the new url as param, instead of waiting. that might be better
		} );

		// the focus is jumping back to the start of the editor, probably caused by the selection problem described in debouncedUpdateEmbedPreview()
		// once that's fixed, test to make sure it goes back to the selected view like it should

		//event.target.focus();
			//todo hack to avoid focus stealiing
			// this might have performance issues, but probably not if this entire function is debounced?
				// see https://github.com/Automattic/wp-calypso/pull/17152#discussion_r142263113
			// don't even need this anymore?
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

				<this.embedView content={ this.state.previewUrl } />
			</Dialog>
		);

		{/*
			saw some situations when switching between embeds where the url was correct when opening the dialog, but the preview was the previous video
				open first embed, change url to https://www.youtube.com/watch?v=ghrL82cc-ss, update
				open second embed, it'll show videopress url, but https://www.youtube.com/watch?v=ghrL82cc-ss as the preview
				might only happen w/ the focus bug, or some other conditions, but test for this once other things are working

			do we have any non-video embeds? if so, test those too

			exception thrown when change it twice in a row. - only in FF
				maybe related to needing to debounce?

			Warning: unmountComponentAtNode(): The node you're attempting to unmount was rendered by another copy of React.
				wrapConsole/<
				app:///./client/components/webpack-build-monitor/index.jsx:174:3
				printWarning
				app:///./node_modules/fbjs/lib/warning.js:35:7
				warning
				app:///./node_modules/fbjs/lib/warning.js:59:7
				unmountComponentAtNode
				app:///./node_modules/react-dom/lib/ReactMount.js:443:15
				wpview/</<
		   >>>	app:///./client/components/tinymce/plugins/wpcom-view/plugin.js:287:5
				...
			*/}
	}
}

const connectedLocalizedEmbedDialog = connect( ( state, { siteId } ) => {
	siteId = siteId ? siteId : getSelectedSiteId( state );

	return { siteId };
} )( localize( EmbedDialog ) );

export default localize( connectedLocalizedEmbedDialog );
