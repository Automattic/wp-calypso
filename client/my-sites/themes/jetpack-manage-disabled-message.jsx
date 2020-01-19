/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import ThemesList from 'components/themes-list';
import { getSiteAdminUrl } from 'state/sites/selectors';

class JetpackManageDisabledMessage extends Component {
	clickOnActivate = () => {
		analytics.ga.recordEvent( 'Jetpack', 'Activate manage', 'Site', this.props.siteId );
	};

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
		const themes = exampleThemesData.map( ( { name, slug: id } ) => ( {
			id,
			name,
			screenshot:
				'https://i1.wp.com/s0.wp.com/wp-content/themes/pub/' + id + '/screenshot.png?w=660',
		} ) );
		return (
			<ThemesList
				themes={ themes }
				getButtonOptions={ noop }
				onScreenshotClick={ noop }
				onMoreButtonClick={ noop }
			/>
		);
	}

	render() {
		return (
			<Main className="themes">
				<SidebarNavigation />
				<JetpackManageErrorPage
					template="optInManage"
					title={ this.props.translate( "Looking to manage this site's themes?" ) }
					siteId={ this.props.siteId }
					section="themes"
					secondaryAction={ this.props.translate( 'Open Site Theme Browser' ) }
					secondaryActionURL={ this.props.adminUrl }
					secondaryActionTarget="_blank"
					actionCallback={ this.clickOnActivate }
					featureExample={ this.renderMockThemes() }
				/>
			</Main>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	adminUrl: getSiteAdminUrl( state, siteId, 'themes.php' ),
} ) )( localize( JetpackManageDisabledMessage ) );
