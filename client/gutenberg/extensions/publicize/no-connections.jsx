/**
 * Publicize no connections info component.
 *
 * Displays notification if there are no connected
 * social accounts, and includes a list of links to
 * connect specific services.
 *
 * @since  5.9.1
 */

/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getAllConnections } from './async-publicize-lib';

class PublicizeNoConnections extends Component {
	constructor( props ) {
		super( props );
		const allConnections = getAllConnections();
		this.state = {
			allConnections: allConnections,
		};
	}

	/**
	 * Opens up popup so user can view/modify the associated connection
	 *
	 * @since 5.9.1
	 *
	 * @param {object} event Event instance for onClick.
	 */
	connectionClick = ( event ) => {
		const href = event.target.getAttribute( 'href' );
		const { refreshCallback } = this.props;
		event.preventDefault();
		/**
		 * Open a popup window, and
		 * when it is closed, refresh connections
		 */
		const popupWin = window.open( href, '', '' );
		const popupTimer = window.setInterval( () => {
			if ( false !== popupWin.closed ) {
				window.clearInterval( popupTimer );
				refreshCallback();
			}
		}, 500 );
	}

	render() {
		const { allConnections } = this.state;
		return (
			<div>
				<strong>{ __( 'Connect social accounts to share post: ' ) }</strong>
				<br />
				<ul className="not-connected">
					{ allConnections.map( c =>
						<li key={ c.name }>
							<a
								className="pub-service"
								key={ c.name }
								title={ sprintf( __( 'Connect and share your posts on %s' ), c.label ) }
								href={ c.url }
								onClick={ this.connectionClick }
							>
								{ c.label }
							</a>
						</li>
					) }
				</ul>
			</div>
		);
	}
}

export default PublicizeNoConnections;
