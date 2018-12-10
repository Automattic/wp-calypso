/** @format */

/**
 * Publicize connections verification component.
 *
 * Component to create Ajax request to check
 * all connections. If any connection tests failed,
 * a refresh link may be provided to the user. If
 * no connection tests fail, this component will
 * not render anything.
 */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Component } from '@wordpress/element';
import { Button, Notice } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class PublicizeConnectionVerify extends Component {
	state = {
		failedConnections: {},
		isLoading: false,
	};

	componentDidMount() {
		this.connectionTestStart();
	}

	/**
	 * Callback for connection test request
	 *
	 * Receives results of connection request and
	 * updates component state to display potentially
	 * failed connections.
	 *
	 * @param {object} response Response from '/publicize/connection-test-results' endpoint
	 */
	connectionTestComplete = response => {
		const failureList = response.filter( connection => ! connection.test_success );
		this.setState( {
			failedConnections: failureList,
			isLoading: false,
		} );
	};

	/**
	 * Callback for connection test request failure
	 */
	connectionTestRequestFailed = () => {
		this.setState( {
			isLoading: false,
		} );
	};

	/**
	 * Starts request to check connections
	 *
	 * Checks connections with using the '/publicize/connection-test-results' endpoint
	 */
	connectionTestStart = () => {
		apiFetch( { path: '/wpcom/v2/publicize/connection-test-results' } )
			.then( this.connectionTestComplete )
			.catch( this.connectionTestRequestFailed );
	};

	/**
	 * Opens up popup so user can refresh connection
	 *
	 * Displays pop up with to specified URL where user
	 * can refresh a specific connection.
	 *
	 * @param {object} event Event instance for onClick.
	 */
	refreshConnectionClick = event => {
		const { href, title } = event.target;
		event.preventDefault();
		// open a popup window
		// when it is closed, kick off the tests again
		const popupWin = window.open( href, title, '' );
		const popupTimer = window.setInterval( () => {
			if ( false !== popupWin.closed ) {
				window.clearInterval( popupTimer );
				this.connectionTestStart();
			}
		}, 500 );
	};

	render() {
		const { failedConnections } = this.state;
		if ( failedConnections.length > 0 ) {
			return (
				<Notice className="jetpack-publicize-notice" isDismissible={ false } status="error">
					<p key="error-title">
						{ __(
							'Before you hit Publish, please refresh the following connection(s) to make sure we can Publicize your post:'
						) }
					</p>
					{ failedConnections.filter( connection => connection.can_refresh ).map( connection => (
						<Button
							href={ connection.refresh_url }
							isSmall
							key={ connection.id }
							onClick={ this.refreshConnectionClick }
							title={ connection.refresh_text }
						>
							{ connection.refresh_text }
						</Button>
					) ) }
				</Notice>
			);
		}
		return null;
	}
}

export default PublicizeConnectionVerify;
