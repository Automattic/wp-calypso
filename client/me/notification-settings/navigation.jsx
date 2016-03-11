/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';

export default React.createClass( {

	displayName: 'NotificationSettingsNavigation',

	render() {
		const navItems = [
			this.navItem( '/me/notifications' ),
			this.navItem( '/me/notifications/comments' ),
			this.navItem( '/me/notifications/updates' ),
			this.navItem( '/me/notifications/subscriptions' )
		];

		return (
			<SectionNav selectedText={ this.getSelectedText() }>
				<NavTabs label="Section" selectedText={ this.getSelectedText() }>
					{ navItems }
				</NavTabs>
			</SectionNav>
		);
	},

	itemLabels() {
		return {
			'/me/notifications': this.translate( 'Notifications' ),
			'/me/notifications/comments': this.translate( 'Comments' ),
			'/me/notifications/updates': this.translate( 'Updates' ),
			'/me/notifications/subscriptions': this.translate( 'Reader Subscriptions' )
		};
	},

	navItem( path ) {
		const isSelectedItem = currentPath => {
			const basePathLowerCase = this.props.path.split( '?' )[0].toLowerCase();
			const currentPathLowerCase = currentPath.toLowerCase();

			return basePathLowerCase === currentPathLowerCase;
		}

		return (
			<NavItem
					path={ path }
					key={ path }
					selected={ isSelectedItem( path ) }>
				{ this.itemLabels()[ path ] }
			</NavItem>
		);
	},

	getSelectedText() {
		return this.itemLabels()[ this.props.path ];
	}
} );
