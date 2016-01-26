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

	render() {
		return(
			<Masterbar>
				<Item url="/" icon="my-sites" className="masterbar__item-logo">
					WordPress<span className="tld">.com</span>
				</Item>
				<Item url={ config( 'login_url' ) } className="masterbar_item-login">
					{ this.translate( 'Log in', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
				</Item>
			</Masterbar>
		);
	},

} );

