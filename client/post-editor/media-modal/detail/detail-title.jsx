/**
 * External dependencies
 */
import React from 'react';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import MediaActions from 'lib/media/actions';
import { userCan } from 'lib/site/utils';
import TrackInputChanges from 'components/track-input-changes';
import FormTextInput from 'components/forms/form-text-input';
import { updateShortcodes } from 'state/shortcodes/actions';

const EditorMediaModalDetailTitle = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		item: React.PropTypes.object
	},

	getInitialState() {
		return {};
	},

	getTitleValue() {
		if ( 'title' in this.state ) {
			return this.state.title;
		}

		if ( this.props.item ) {
			return this.props.item.title;
		}
	},

	bumpStat: function() {
		analytics.mc.bumpStat( 'calypso_media_edit_details', 'title' );
		analytics.ga.recordEvent( 'Media', 'Changed Item Title' );
	},

	onChange( event ) {
		this.setState( {
			title: event.target.value
		} );
	},

	onKeyUp( event ) {
		switch ( event.key ) {
			case 'Enter':
				this.saveTitle();
				event.target.blur();
				break;

			case 'Escape':
				this.resetTitle();
				event.target.blur();
				break;
		}
	},

	saveTitle: debounce( function() {
		// This function is debounced to prevent the case where two consecutive
		// save attempts would be made as a consequence of the blur in `onKeyUp`
		if ( this.props.site && this.props.item && 'title' in this.state && this.state.title !== this.props.item.title ) {
			MediaActions.update( this.props.site.ID, {
				ID: this.props.item.ID,
				title: this.state.title
			}, false, this.props.updateShortcodes );
		}

		if ( this.isMounted() ) {
			this.resetTitle();
		}
	}, 0 ),

	resetTitle() {
		this.replaceState( this.getInitialState() );
	},

	render() {
		return (
			<TrackInputChanges onNewValue={ this.bumpStat }>
				<FormTextInput
					onKeyUp={ this.onKeyUp }
					onChange={ this.onChange }
					onBlur={ this.saveTitle }
					value={ this.getTitleValue() }
					placeholder={ this.translate( 'Untitled' ) }
					readOnly={ ! userCan( 'upload_files', this.props.site ) }
					className="editor-media-modal-detail__title-input" />
			</TrackInputChanges>
		);
	}
} );

export default connect(
	null,
	{
		updateShortcodes
	}
)( EditorMediaModalDetailTitle );
