/**
 * External dependencies
 */
import React from 'react';
import _debug from 'debug';

/**
 * Internal dependencies
 */
import PostEditStore from 'lib/posts/post-edit-store';
import PreferencesActions from 'lib/preferences/actions';
import PreferencesStore from 'lib/preferences/store';
import EditorMediaModalGalleryHelp from './gallery-help';

/**
 * Module variables
 */
const debug = _debug( 'calypso:media-modal-gallery-help' );

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryHelpContainer',

	getInitialState() {
		return this.getState();
	},

	componentDidMount() {
		debug( 'Mounting %s React component', this.constructor.displayName );
		PreferencesStore.on( 'change', this.updateState );

		if ( undefined === this.state.preferences ) {
			PreferencesActions.fetch();
		}
	},

	componentWillUnmount() {
		PreferencesStore.off( 'change', this.updateState );
	},

	updateState() {
		this.setState( this.getState() );
	},

	getState() {
		return {
			preferences: PreferencesStore.getAll(),
		};
	},

	hasDismissedHelp() {
		if ( sessionStorage.getItem( 'mediaModalGalleryInstructionsDismissed' ) ) {
			debug( 'Avoiding instructions due to session dismissal' );
			return true;
		}

		const { preferences } = this.state;
		if ( preferences && preferences.mediaModalGalleryInstructionsDismissed ) {
			debug( 'Avoiding instructions due to persisted user preference' );
			return true;
		}

		if ( undefined === preferences ) {
			debug( 'Avoiding instructions because preferences have not yet loaded' );
			return true;
		}

		return false;
	},

	setDismissedPreference( { remember } ) {
		if ( remember ) {
			debug( 'Dismissing instructions forever' );
			PreferencesActions.set( 'mediaModalGalleryInstructionsDismissed', true );
		} else {
			debug( 'Dismissing instructions for session' );
			sessionStorage.setItem( 'mediaModalGalleryInstructionsDismissed', true );
		}
	},

	render() {
		if ( ! PostEditStore.get() ) {
			debug( 'Avoiding instructions because user is not editing post' );
			return null;
		}

		if ( this.hasDismissedHelp() ) {
			return null;
		}

		debug( 'Displaying instructions' );

		return (
			<EditorMediaModalGalleryHelp onDismiss={ this.setDismissedPreference } />
		);
	}
} );
