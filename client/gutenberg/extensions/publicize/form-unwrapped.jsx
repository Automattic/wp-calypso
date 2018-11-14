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

class PublicizeFormUnwrapped extends Component {
	constructor( props ) {
		super( props );
		const { initializePublicize, staticConnections } = this.props;
		const initialTitle = '';
		// Connection data format must match 'publicize' REST field.
		const initialActiveConnections = staticConnections.map( c => {
			return {
				id: c.id,
				should_share: c.enabled,
			};
		} );
		initializePublicize( initialTitle, initialActiveConnections );
	}

	/**
	 * Check to see if form should be disabled.
	 *
	 * Checks full connection list to determine if all are disabled.
	 * If they all are, it returns true to disable whole form.
	 *
	 * @return {boolean} True if whole form should be disabled.
	 */
	isDisabled() {
		const { staticConnections } = this.props;
		// Check to see if at least one connection is not disabled
		const formEnabled = staticConnections.some( c => ! c.disabled );
		return ! formEnabled;
	}

	render() {
		const {
			staticConnections,
			toggleConnection,
			messageChange,
			shareMessage,
			refreshCallback,
		} = this.props;
		const MAXIMUM_MESSAGE_LENGTH = 256;
		const charactersRemaining = MAXIMUM_MESSAGE_LENGTH - shareMessage.length;
		const characterCountClass = classnames( 'jetpack-publicize-character-count', {
			'wpas-twitter-length-limit': charactersRemaining <= 0,
		} );

		return (
			<div id="publicize-form">
				<ul>
					{ staticConnections.map( c => (
						<PublicizeConnection
							connectionData={ c }
							key={ c.id }
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
						onChange={ messageChange }
						placeholder={ __( 'Publicize + Gutenberg :)' ) }
						disabled={ this.isDisabled() }
						maxLength={ MAXIMUM_MESSAGE_LENGTH }
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
