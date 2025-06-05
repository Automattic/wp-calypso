import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

class NotificationSettingsNavigation extends Component {
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
			'/me/notifications/subscriptions': this.props.translate( 'Subscription settings' ),
		};
	};

	navItem = ( path ) => {
		const pathWithOptionalReferrer =
			path + ( page.current.includes( 'referrer=management' ) ? '?referrer=management' : '' );

		return (
			<NavItem
				path={ pathWithOptionalReferrer }
				key={ path }
				selected={ this.props.path === pathWithOptionalReferrer }
			>
				{ this.itemLabels()[ path ] }
			</NavItem>
		);
	};

	getSelectedText = () => {
		return this.itemLabels()[ this.props.path ];
	};
}

export default localize( NotificationSettingsNavigation );
