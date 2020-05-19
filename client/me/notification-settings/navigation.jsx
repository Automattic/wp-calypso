/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';

class NotificationSettingsNavigation extends React.Component {
	static displayName = 'NotificationSettingsNavigation';

	render() {
		const navItems = [
			this.navItem( '/me/notifications' ),
			this.navItem( '/me/notifications/comments' ),
			this.navItem( '/me/notifications/updates' ),
			this.navItem( '/me/notifications/subscriptions' ),
		];

		return (
			<SectionNav selectedText={ this.getSelectedText() }>
				<NavTabs label="Section" selectedText={ this.getSelectedText() }>
					{ navItems }
				</NavTabs>
			</SectionNav>
		);
	}

	itemLabels = () => {
		return {
			'/me/notifications': this.props.translate( 'Notifications' ),
			'/me/notifications/comments': this.props.translate( 'Comments' ),
			'/me/notifications/updates': this.props.translate( 'Updates' ),
			'/me/notifications/subscriptions': this.props.translate( 'Reader Subscriptions' ),
		};
	};

	navItem = ( path ) => {
		return (
			<NavItem path={ path } key={ path } selected={ this.props.path === path }>
				{ this.itemLabels()[ path ] }
			</NavItem>
		);
	};

	getSelectedText = () => {
		return this.itemLabels()[ this.props.path ];
	};
}

export default localize( NotificationSettingsNavigation );
