/**
 * Publicize no connections info component.
 *
 * Displays notification if there are no connected
 * social accounts, and includes a list of links to
 * connect specific services.
 */

/**
 * External dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class PublicizeNoConnections extends Component {
	/**
	 * Opens up popup so user can view/modify the associated connection
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
		const { services } = this.props;
		return (
			<div>
				<strong>{ __( 'Connect social accounts to share post: ' ) }</strong>
				<br />
				<ul className="not-connected">
					{ services && services.map( c =>
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

export default withSelect(
	select => ( {
		services: select( 'jetpack/publicize' ).getServices(),
	} )
)( PublicizeNoConnections );
