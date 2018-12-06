/** @format */

/**
 * Publicize sharing form component.
 *
 * Displays text area and connection list to allow user
 * to select connections to share to and write a custom
 * sharing message.
 */

// Since this is a Jetpack originated block in Calypso codebase,
// we're relaxing some accessibility rules.
/* eslint jsx-a11y/label-has-for: 0 */

/**
 * External dependencies
 */
import classnames from 'classnames';
import { sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import PublicizeConnection from './connection';
import PublicizeSettingsButton from './settings-button';
import { __, _n } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const MAXIMUM_MESSAGE_LENGTH = 256;

class PublicizeFormUnwrapped extends Component {
	state = {
		hasEditedShareMessage: false,
	};

	/**
	 * Check to see if form should be disabled.
	 *
	 * Checks full connection list to determine if all are disabled.
	 * If they all are, it returns true to disable whole form.
	 *
	 * @return {boolean} True if whole form should be disabled.
	 */
	isDisabled() {
		return this.props.connections.every( connection => ! connection.toggleable );
	}

	getShareMessage() {
		const { shareMessage, defaultShareMessage } = this.props;
		return ! this.state.hasEditedShareMessage && shareMessage === ''
			? defaultShareMessage
			: shareMessage;
	}

	onMessageChange = event => {
		const { messageChange } = this.props;
		this.setState( { hasEditedShareMessage: true } );
		messageChange( event );
	};

	render() {
		const { connections, toggleConnection, refreshCallback } = this.props;
		const shareMessage = this.getShareMessage();
		const charactersRemaining = MAXIMUM_MESSAGE_LENGTH - shareMessage.length;
		const characterCountClass = classnames( 'jetpack-publicize-character-count', {
			'wpas-twitter-length-limit': charactersRemaining <= 0,
		} );

		return (
			<div id="publicize-form">
				<ul className="jetpack-publicize__connections-list">
					{ connections.map( ( { display_name, enabled, id, service_name, toggleable } ) => (
						<PublicizeConnection
							disabled={ ! toggleable }
							enabled={ enabled }
							key={ id }
							id={ id }
							label={ display_name }
							name={ service_name }
							toggleConnection={ toggleConnection }
						/>
					) ) }
				</ul>
				<PublicizeSettingsButton refreshCallback={ refreshCallback } />
				<label className="jetpack-publicize-message-note" htmlFor="wpas-title">
					{ __( 'Customize your message' ) }
				</label>
				<div className="jetpack-publicize-message-box">
					<textarea
						value={ shareMessage }
						onChange={ this.onMessageChange }
						disabled={ this.isDisabled() }
						maxLength={ MAXIMUM_MESSAGE_LENGTH }
						placeholder={ __(
							"Write a message for your audience here. If you leave this blank, we'll use the post title as the message."
						) }
						rows={ 4 }
					/>
					<div className={ characterCountClass }>
						{ sprintf(
							_n( '%d character remaining', '%d characters remaining', charactersRemaining ),
							charactersRemaining
						) }
					</div>
				</div>
			</div>
		);
	}
}

export default PublicizeFormUnwrapped;
