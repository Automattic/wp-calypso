/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import ActionPanel from 'my-sites/site-settings/action-panel';
import ActionPanelTitle from 'my-sites/site-settings/action-panel/title';
import ActionPanelBody from 'my-sites/site-settings/action-panel/body';
import ActionPanelFooter from 'my-sites/site-settings/action-panel/footer';
import ActionPanelFigure from 'my-sites/site-settings/action-panel/figure';
import Notice from 'components/notice';
import Button from 'components/button';
import { getTheme, getActiveTheme } from 'state/themes/selectors';
import { getSelectedSite } from 'state/ui/selectors';

let ThemeSetup = ( { site, theme, translate } ) => {
	const onBack = () => {
		page( '/settings/general/' + site.domain );
	}

	return (
		<div className="main main-column" role="main">
			<HeaderCake onClick={ onBack }><h1>{ translate( 'Theme Setup' ) }</h1></HeaderCake>
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelTitle>{ translate( 'Theme Setup' ) }</ActionPanelTitle>
					<Notice status="is-warning" showDismiss={ false }>
						{ translate( 'This action cannot be undone.' ) }
					</Notice>
					<ActionPanelFigure>
						<a href={ theme.demo_uri }>
							<img src={ theme.screenshot } />
							<p>{ translate( 'Current theme: %(theme)', { args: { theme: theme.name } } ) }</p>
						</a>
					</ActionPanelFigure>
					<p>{ translate( 'Getting your site to look like your theme\'s demo can be confusing. The Theme Setup tool will copy the demo site\'s settings over to your site automatically.' ) }</p>
					<p>{ translate( 'You can choose to start from scratch, in which Theme Setup {{strong}}deletes all of your existing content{{/strong}}, or you can save your current content. In either case, you will see some placeholder content which is needed by Theme Setup.', { components: { strong: <strong /> } } ) }</p>
				</ActionPanelBody>
				<ActionPanelFooter>
					<Button scary={ true }>
						{ translate( 'Set Up From Scratch' ) }
					</Button>
					<Button>
						{ translate( 'Set Up And Keep Content' ) }
					</Button>
				</ActionPanelFooter>
			</ActionPanel>
		</div>
	);
};

ThemeSetup = localize( ThemeSetup );

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );

	// y u no werk getActiveTheme?
	state.themes.activeThemes = { 112391175: 'shoreditch' };
	const themeId = getActiveTheme( state, site.ID );

	// y u no werk getTheme?
	let theme = getTheme( state, site.ID, themeId );
	theme = {
		name: 'Shoreditch',
		demo_uri: 'https://shoreditchdemo.wordpress.com/',
		screenshot: 'https://i2.wp.com/theme.wordpress.com/wp-content/themes/pub/shoreditch/screenshot.png',
	};

	return {
		site,
		theme
	};
}

export default connect( mapStateToProps )( ThemeSetup );

