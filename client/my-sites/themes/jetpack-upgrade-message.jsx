/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';

const JetpackUpgradeMessage = React.createClass( {
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
					secondaryAction={ this.props.translate( 'Open Site Theme Browser' ) }
					secondaryActionURL={ this.props.site.options.admin_url + 'themes.php' }
					secondaryActionTarget="_blank"
				/>
			</Main>
		);
	}
} );

export default localize( JetpackUpgradeMessage );
