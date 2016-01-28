/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react/addons';
import Masterbar from './masterbar';

/**
 * Internal dependencies
 */
import Item from './item';
import config from 'config';

export default React.createClass( {
	propTypes: {
		url: React.PropTypes.string.isRequired
	},

	render() {
		return(
			<Masterbar>
				<Item url={ this.props.url } icon="my-sites" className="masterbar__item-logo is-loggedout">
					WordPress<span className="tld">.com</span>
				</Item>
				<div className="masterbar__login-links">
					<Item url={ '/start' }>
						{ this.translate( 'Sign up', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
					</Item>
					<Item url={ config( 'login_url' ) }>
						{ this.translate( 'Log in', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
					</Item>
				</div>
			</Masterbar>
		);
	},
} );
