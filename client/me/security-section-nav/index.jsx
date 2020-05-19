/**
 * External dependencies
 */

import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';

export default class extends React.Component {
	static displayName = 'SecuritySectionNav';

	static propTypes = {
		path: PropTypes.string.isRequired,
	};

	getNavtabs = () => {
		const tabs = [
			{
				title: i18n.translate( 'Password' ),
				path: '/me/security',
			},
			config.isEnabled( 'signup/social-management' )
				? {
						title: i18n.translate( 'Social Login' ),
						path: '/me/security/social-login',
				  }
				: null,
			{
				title: i18n.translate( 'Two-Step Authentication' ),
				path: '/me/security/two-step',
			},
			{
				title: config.isEnabled( 'signup/social-management' )
					? // This was shortened from 'Connected Applications' due to space constraints.
					  i18n.translate( 'Connected Apps' )
					: i18n.translate( 'Connected Applications' ),
				path: '/me/security/connected-applications',
			},
			{
				title: i18n.translate( 'Account Recovery' ),
				path: '/me/security/account-recovery',
			},
		].filter( ( tab ) => tab !== null );

		return tabs;
	};

	getFilteredPath = () => {
		const paramIndex = this.props.path.indexOf( '?' );
		return paramIndex < 0 ? this.props.path : this.props.path.substring( 0, paramIndex );
	};

	getSelectedText = () => {
		let text = '',
			filteredPath = this.getFilteredPath(),
			found = find( this.getNavtabs(), { path: filteredPath } );

		if ( 'undefined' !== typeof found ) {
			text = String( found.title );
		}

		return text;
	};

	onClick = () => {
		window.scrollTo( 0, 0 );
	};

	render() {
		return (
			<SectionNav selectedText={ this.getSelectedText() }>
				<NavTabs>
					{ this.getNavtabs().map( function ( tab ) {
						return (
							<NavItem
								key={ tab.path }
								onClick={ this.onClick }
								path={ tab.path }
								selected={ tab.path === this.getFilteredPath() }
							>
								{ tab.title }
							</NavItem>
						);
					}, this ) }
				</NavTabs>
			</SectionNav>
		);
	}
}
