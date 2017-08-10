/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CountedTextarea from 'components/forms/counted-textarea';
import FormTextarea from 'components/forms/form-textarea';
import InfoPopover from 'components/info-popover';
import TrackInputChanges from 'components/track-input-changes';
import PostActions from 'lib/posts/actions';
import stats from 'lib/posts/stats';

export default localize(class extends React.Component {
    static displayName = 'PublicizeMessage';

	static propTypes = {
		disabled: React.PropTypes.bool,
		message: React.PropTypes.string,
		preview: React.PropTypes.string,
		acceptableLength: React.PropTypes.number,
		requireCount: React.PropTypes.bool,
		onChange: React.PropTypes.func
	};

	static defaultProps = {
		disabled: false,
		message: '',
		acceptableLength: 140,
		requireCount: false,
	};

	onChange = event => {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		if ( this.props.onChange ) {
			this.props.onChange( event.target.value );
		} else {
			PostActions.updateMetadata( '_wpas_mess', event.target.value );
		}
	};

	recordStats = () => {
		stats.recordStat( 'sharing_message_changed' );
		stats.recordEvent( 'Publicize Sharing Message Changed' );
	};

	renderInfoPopover = () => {
		return (
		    <InfoPopover
				className="publicize-message-counter-info"
				position="bottom left"
				gaEventCategory="Editor"
				popoverName="SharingMessage"
			>
				{ this.props.translate(
					'The length includes space for the link to your post and an attached image.',
					{ context: 'Post editor sharing message counter explanation' }
			) }
			</InfoPopover>
		);
	};

	renderTextarea = () => {
		if ( this.props.requireCount ) {
			return (
				<CountedTextarea
					disabled={ this.props.disabled }
					value={ this.props.message }
					placeholder={ this.props.preview }
					countPlaceholderLength={ true }
					onChange={ this.onChange }
					showRemainingCharacters={ true }
					acceptableLength={ this.props.acceptableLength }
					className="editor-sharing__message-input"
				>
					{ this.renderInfoPopover() }
				</CountedTextarea>
			);
		} else {
			return (
				<FormTextarea
					disabled={ this.props.disabled }
					value={ this.props.message }
					placeholder={ this.props.preview }
					onChange={ this.onChange }
					className="editor-sharing__message-input" />
			);
		}
	};

	render() {
		return (
		    <div className="editor-sharing__publicize-message">
				<h5 className="editor-sharing__message-heading">
					{ this.props.translate( 'Customize the message', { context: 'Post editor sharing message heading' } ) }
				</h5>
				<TrackInputChanges onNewValue={ this.recordStats }>
					{ this.renderTextarea() }
				</TrackInputChanges>
			</div>
		);
	}
});
