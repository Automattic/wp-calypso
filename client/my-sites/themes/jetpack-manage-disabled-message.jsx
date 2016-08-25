/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import ThemesList from 'components/themes-list';

export default React.createClass( {
	displayName: 'JetpackManageDisabledMessage',

	propTypes: {
		site: PropTypes.shape( {
			getRemoteManagementURL: PropTypes.func.isRequired,
			options: PropTypes.shape( { admin_url: PropTypes.string.isRequired } ).isRequired
		} ).isRequired
	},

	clickOnActivate() {
		analytics.ga.recordEvent( 'Jetpack', 'Activate manage', 'Site', this.props.site ? this.props.site.ID : null );
	},

	renderMockThemes() {
		const exampleThemesData = [
			{ name: 'Dyad', slug: 'dyad' },
			{ name: 'Independent Publisher', slug: 'independent-publisher' },
			{ name: 'Sela', slug: 'sela' },
			{ name: 'Hemingway Rewritten', slug: 'hemingway-rewritten' },
			{ name: 'Twenty Sixteen', slug: 'twentysixteen' },
			{ name: 'Penscratch', slug: 'penscratch' },
			{ name: 'Edin', slug: 'edin' },
			{ name: 'Publication', slug: 'publication' },
			{ name: 'Harmonic', slug: 'harmonic' },
		];
		const themes = exampleThemesData.map( function( theme ) {
			return {
				id: theme.slug,
				name: theme.name,
				screenshot: 'https://i1.wp.com/s0.wp.com/wp-content/themes/pub/' + theme.slug + '/screenshot.png?w=660'
			}
		} );
		return (
			<ThemesList themes={ themes }
				getButtonOptions={ noop }
				onScreenshotClick= { noop }
				onMoreButtonClick= { noop } />
		);
	},

	render() {
		return (
			<Main className="themes">
				<SidebarNavigation />
				<JetpackManageErrorPage
					template="optInManage"
					title={ this.translate( 'Looking to manage this site\'s themes?' ) }
					site={ this.props.site }
					section="themes"
					secondaryAction={ this.translate( 'Open Site Theme Browser' ) }
					secondaryActionURL={ this.props.site.options.admin_url + 'themes.php' }
					secondaryActiontarget="_blank"
					rel="noopener noreferrer"
					actionCallback={ this.clickOnActivate }
					featureExample={ this.renderMockThemes() } />
			</Main>
		);
	}
} );
