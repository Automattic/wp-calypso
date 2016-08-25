/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';

export default React.createClass( {
	propTypes: {
		site: PropTypes.object
	},

	render() {
		return (
			<Main className="themes">
				<SidebarNavigation />
				<JetpackManageErrorPage
					template="updateJetpack"
					site={ this.props.site }
					version="3.7"
					secondaryAction={ this.translate( 'Open Site Theme Browser' ) }
					secondaryActionURL={ this.props.site.options.admin_url + 'themes.php' }
					secondaryActiontarget="_blank"
					rel="noopener noreferrer"
				/>
			</Main>
		);
	}
} );
