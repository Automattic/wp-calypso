/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';

export default React.createClass( {
	displayName: 'JetpackManageDisabledMessage',

	propTypes: {
		site: PropTypes.shape( {
			getRemoteManagementURL: PropTypes.func.isRequired,
			options: PropTypes.shape( { admin_url: PropTypes.string.isRequired } ).isRequired
		} ).isRequired
	},

	clickOnActivate: function() {
		analytics.ga.recordEvent( 'Jetpack', 'Activate manage', 'Site', this.props.site ? this.props.site.ID : null );
	},

	render() {
		return (
			<Main className="themes">
				<SidebarNavigation />
				<JetpackManageErrorPage
					template="optInManage"
					site={ this.props.site }
					actionURL={ this.props.site.getRemoteManagementURL() }
					illustration="/calypso/images/drake/drake-jetpack.svg"
					secondaryAction={ this.translate( 'Open Site Theme Browser' ) }
					secondaryActionURL={ this.props.site.options.admin_url + 'themes.php' }
					secondaryActionTarget="_blank"
					actionCallback={ this.clickOnActivate }
				/>
			</Main>
		);
	}
} );
