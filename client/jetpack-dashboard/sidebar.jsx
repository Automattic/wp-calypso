/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { memoize } from 'lodash';

/**
 * Internal dependencies
 */
import Sidebar from 'layout/sidebar';
import SidebarItem from 'layout/sidebar/item';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import getCurrentRoute from 'state/selectors/get-current-route';

class JetpackDashboardSidebar extends React.PureComponent {
	isItemSelected( itemPath, isStrict = true ) {
		const { path } = this.props;

		if ( isStrict ) {
			return path === itemPath;
		}

		return path.indexOf( itemPath ) === 0;
	}

	toggleSection = memoize( id => () => this.props.toggleSection( id ) );

	render() {
		const { translate } = this.props;

		return (
			<Sidebar>
				<SidebarItem
					label={ translate( 'Jetpack.com Dashboard' ) }
					link="/"
					selected={ this.isItemSelected( '/' ) }
					icon="plans"
				/>
				<ExpandableSidebarMenu expanded title={ translate( 'Security' ) } icon="lock">
					<SidebarItem
						label={ translate( 'Dashboard' ) }
						link="/security"
						selected={ this.isItemSelected( '/security' ) }
					/>
					<SidebarItem
						label={ translate( 'Backups' ) }
						link="/security/backups"
						selected={ this.isItemSelected( '/security/backups' ) }
					/>
					<SidebarItem
						label={ translate( 'Malware scan' ) }
						link="/security/scan"
						selected={ this.isItemSelected( '/security/scan' ) }
					/>
					<SidebarItem
						label={ translate( 'Anti-spam' ) }
						link="/security/anti-spam"
						selected={ this.isItemSelected( '/security/anti-spam' ) }
					/>
				</ExpandableSidebarMenu>
				<ExpandableSidebarMenu
					expanded={ false }
					title={ translate( 'Performance' ) }
					icon="time"
				/>
				<ExpandableSidebarMenu expanded={ false } title={ translate( 'Marketing' ) } icon="money" />
			</Sidebar>
		);
	}
}

export default connect( state => ( {
	path: getCurrentRoute( state ),
} ) )( localize( JetpackDashboardSidebar ) );
