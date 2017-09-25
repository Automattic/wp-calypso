/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CountedTextarea from 'components/forms/counted-textarea';
import FormTextarea from 'components/forms/form-textarea';
import InfoPopover from 'components/info-popover';
import TrackInputChanges from 'components/track-input-changes';
import PostActions from 'lib/posts/actions';
import * as stats from 'lib/posts/stats';

class PublicizeMessage extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		message: PropTypes.string,
		preview: PropTypes.string,
		acceptableLength: PropTypes.number,
		requireCount: PropTypes.bool,
		onChange: PropTypes.func
	};

	static defaultProps = {
		disabled: false,
		message: '',
		acceptableLength: 140,
		requireCount: false,
	};

	onChange = ( event ) => {
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

	renderInfoPopover() {
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
	}

	renderTextarea() {
		const placeholder = this.props.preview || this.props.translate( 'Write a message for your audience here.' );

		if ( this.props.requireCount ) {
			return (
				<CountedTextarea
					disabled={ this.props.disabled }
					value={ this.props.message }
					placeholder={ placeholder }
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
					placeholder={ placeholder }
					onChange={ this.onChange }
					className="editor-sharing__message-input" />
			);
		}
	}

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
}

export default localize( PublicizeMessage );
