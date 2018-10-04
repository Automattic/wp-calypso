/**
 * Publicize sharing form component.
 *
 * Displays text area and connection list to allow user
 * to select connections to share to and write a custom
 * sharing message.
 *
 * @since  5.9.1
 */

// Since this is a Jetpack originated block in Calypso codebase,
// we're relaxing some accessibility rules.
/* eslint jsx-a11y/label-has-for: 0 */

/**
 * External dependencies
 */
import classnames from 'classnames';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { isNil } from 'lodash';

/**
 * Internal dependencies
 */
import PublicizeConnection from './connection';
import PublicizeSettingsButton from './settings-button';

class PublicizeFormUnwrapped extends Component {
	constructor( props ) {
		super( props );
		const { initializePublicize, staticConnections } = this.props;
		const initialTitle = '';
		// Connection data format must match 'publicize' REST field registered in {@see class-jetpack-publicize-gutenberg.php}.
		const initialActiveConnections = staticConnections.map( ( c ) => {
			return ( {
				unique_id: c.unique_id,
				should_share: c.checked,
			} );
		} );
		initializePublicize( initialTitle, initialActiveConnections );
	}

	/**
	 * Check to see if form should be disabled.
	 *
	 * Checks full connection list to determine if all are disabled.
	 * If they all are, it returns true to disable whole form.
	 *
	 * @since 5.9.1
	 *
	 * @return {boolean} True if whole form should be disabled.
	 */
	isDisabled() {
		const { staticConnections } = this.props;
		// Check to see if at least one connection is not disabled
		const formEnabled = staticConnections.some( c => ! c.disabled );
		return ! formEnabled;
	}

	/**
	 * Checks if a connection is turned on/off.
	 *
	 * Looks up connection by ID in activeConnections prop which is
	 * an array of objects with properties 'unique_id' and 'should_share';
	 * looks for an array entry with a 'unique_id' property that matches
	 * the parameter value. If found, the connection 'should_share' value
	 * is returned.
	 *
	 * @since 5.9.1
	 *
	 * @param {string} uniqueId Connection ID.
	 * @return {boolean} True if the connection is currently switched on.
	 */
	isConnectionOn( uniqueId ) {
		const { activeConnections } = this.props;
		const matchingConnection = activeConnections.find( c => uniqueId === c.unique_id );
		if ( isNil( matchingConnection ) ) {
			return false;
		}
		return matchingConnection.should_share;
	}

	render() {
		const {
			staticConnections,
			connectionChange,
			messageChange,
			shareMessage,
			refreshCallback,
		} = this.props;
		const MAXIMUM_MESSAGE_LENGTH = 256;
		const charactersRemaining = MAXIMUM_MESSAGE_LENGTH - shareMessage.length;
		const characterCountClass = classnames(
			'jetpack-publicize-character-count',
			{ 'wpas-twitter-length-limit': ( charactersRemaining <= 0 ) }
		);

		return (
			<div className="misc-pub-section misc-pub-section-last">
				<div id="publicize-form">
					<ul>
						{staticConnections.map( c =>
							<PublicizeConnection
								connectionData={ c }
								key={ c.unique_id }
								connectionOn={ this.isConnectionOn( c.unique_id ) }
								connectionChange={ connectionChange }
							/>
						) }
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
							{ sprintf( _n( '%d character remaining', '%d characters remaining', charactersRemaining ), charactersRemaining ) }
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default PublicizeFormUnwrapped;
