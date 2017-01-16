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
import QueryActiveTheme from 'components/data/query-active-theme';
import QueryTheme from 'components/data/query-theme';
import { getSelectedSite } from 'state/ui/selectors';
import { getActiveTheme, getTheme } from 'state/themes/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import ActiveThemeScreenshot from './active-theme-screenshot';

let ThemeSetup = ( { site, isJetpack, themeId, theme, translate, activeSiteDomain } ) => {
	const onBack = () => {
		page( '/settings/general/' + activeSiteDomain );
	};

	const noticeText = site && isJetpack ? translate( 'This feature is currently unavailable for Jetpack sites.' ) : translate( 'This action cannot be undone.' );

	return (
		<div className="main theme-setup" role="main">
			{ site && <QueryActiveTheme siteId={ site.ID } /> }
			{ themeId && <QueryTheme siteId={ 'wpcom' } themeId={ themeId } /> }
			<HeaderCake onClick={ onBack }><h1>{ translate( 'Theme Setup' ) }</h1></HeaderCake>
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelTitle>{ translate( 'Theme Setup' ) }</ActionPanelTitle>
					<Notice status={ isJetpack ? 'is-error' : 'is-warning' } showDismiss={ false }>
						{ noticeText }
					</Notice>
					<ActionPanelFigure>
						<ActiveThemeScreenshot theme={ theme } />
					</ActionPanelFigure>
					<p>{ translate( 'Want your site to look like the demo? Use Theme Setup to automatically apply the demo site\'s settings to your site.' ) }</p>
					<p>{ translate( 'You can apply Theme Setup to your current site and keep all your posts, pages, and widgets, or use it for a fresh start and delete everything currently on your site. In both cases, placeholder text will appear on your site – some themes need certain elements to look like the demo, so Theme Setup adds those for you. Please customize it!', { components: { strong: <strong /> } } ) }</p>
				</ActionPanelBody>
				<ActionPanelFooter>
					<Button primary={ true } disabled={ site && theme && ! isJetpack ? false : true }>
						{ translate( 'Set Up And Keep Content' ) }
					</Button>
					<Button scary={ true } disabled={ site && theme && ! isJetpack ? false : true }>
						{ translate( 'Set Up And Delete Content' ) }
					</Button>
				</ActionPanelFooter>
			</ActionPanel>
		</div>
	);
};

ThemeSetup = localize( ThemeSetup );

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const isJetpack = site && isJetpackSite( state, site.ID );
	const themeId = site && getActiveTheme( state, site.ID );
	const theme = themeId && getTheme( state, 'wpcom', themeId );
	return {
		site,
		isJetpack,
		themeId,
		theme,
	};
};

export default connect( mapStateToProps )( ThemeSetup );

