/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react/addons';
import MasterbarMinimal from './minimal';

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
			<MasterbarMinimal url={ this.props.url }>
				<div className="masterbar__login-links">
					<Item url={ '/start' }>
						{ this.translate( 'Sign up', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
					</Item>
					<Item url={ config( 'login_url' ) }>
						{ this.translate( 'Log in', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
					</Item>
				</div>
			</MasterbarMinimal>
		);
	},
} );
