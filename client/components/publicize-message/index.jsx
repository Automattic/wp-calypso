/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import CountedTextarea from 'calypso/components/forms/counted-textarea';
import FormTextarea from 'calypso/components/forms/form-textarea';
import InfoPopover from 'calypso/components/info-popover';
import TrackInputChanges from 'calypso/components/track-input-changes';
import { recordEditorStat, recordEditorEvent } from 'calypso/state/posts/stats';

/**
 * Style dependencies
 */
import './style.scss';

class PublicizeMessage extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		message: PropTypes.string,
		preview: PropTypes.string,
		acceptableLength: PropTypes.number,
		requireCount: PropTypes.bool,
		onChange: PropTypes.func,
		preFilledMessage: PropTypes.string,
	};

	static defaultProps = {
		disabled: false,
		message: '',
		acceptableLength: 280,
		requireCount: false,
		onChange: noop,
		preFilledMessage: '',
	};

	userHasEditedMessage = false;

	onChange = ( event ) => {
		this.userHasEditedMessage = true;
		this.props.onChange( event.target.value );
	};

	recordStats = () => {
		this.props.recordEditorStat( 'sharing_message_changed' );
		this.props.recordEditorEvent( 'Publicize Sharing Message Changed' );
	};

	shouldPreFillMessage() {
		return ! this.userHasEditedMessage && '' === this.props.message;
	}

	getMessage() {
		if ( this.shouldPreFillMessage() ) {
			return this.props.preFilledMessage;
		}
		return this.props.message;
	}

	renderInfoPopover() {
		return (
			<InfoPopover
				className="publicize-message__counter-info"
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
		const placeholder =
			this.props.preview || this.props.translate( 'Write a message for your audience here.' );
		if ( this.props.requireCount ) {
			return (
				<CountedTextarea
					disabled={ this.props.disabled }
					placeholder={ placeholder }
					countPlaceholderLength
					value={ this.getMessage() }
					onChange={ this.onChange }
					showRemainingCharacters
					acceptableLength={ this.props.acceptableLength }
					className="publicize-message__input"
				>
					{ this.renderInfoPopover() }
				</CountedTextarea>
			);
		}
		return (
			<FormTextarea
				disabled={ this.props.disabled }
				value={ this.getMessage() }
				placeholder={ placeholder }
				onChange={ this.onChange }
				className="publicize-message__input"
			/>
		);
	}

	render() {
		return (
			<div className="publicize-message">
				<TrackInputChanges onNewValue={ this.recordStats }>
					{ this.renderTextarea() }
				</TrackInputChanges>
			</div>
		);
	}
}

export default connect( null, { recordEditorStat, recordEditorEvent } )(
	localize( PublicizeMessage )
);
