import i18n from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

export default class SecuritySectionNav extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
	};

	getNavtabs = () => {
		return [
			{
				title: i18n.translate( 'Password' ),
				path: '/me/security',
			},
			{
				title: i18n.translate( 'Social Login' ),
				path: '/me/security/social-login',
			},
			{
				title: i18n.translate( 'Two-Step Authentication' ),
				path: '/me/security/two-step',
			},
			{
				title: i18n.translate( 'Connected Apps' ),
				path: '/me/security/connected-applications',
			},
			{
				title: i18n.translate( 'Account Recovery' ),
				path: '/me/security/account-recovery',
			},
		];
	};

	getFilteredPath = () => {
		const paramIndex = this.props.path.indexOf( '?' );
		return paramIndex < 0 ? this.props.path : this.props.path.substring( 0, paramIndex );
	};

	getSelectedText = () => {
		let text = '';
		const filteredPath = this.getFilteredPath();
		const found = find( this.getNavtabs(), { path: filteredPath } );

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
