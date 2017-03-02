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
import QueryActiveTheme from 'components/data/query-active-theme';
import QueryTheme from 'components/data/query-theme';
import ThemeSetupCard from './theme-setup-card';
import ThemeSetupPlaceholder from './theme-setup-placeholder';
import { getSelectedSite } from 'state/ui/selectors';
import { getActiveTheme, getTheme } from 'state/themes/selectors';
import { openDialog } from 'state/ui/theme-setup/actions';

let ThemeSetup = ( { site, themeId, theme, translate, activeSiteDomain, onClickKeepContent } ) => {
	const onBack = () => {
		page( '/settings/general/' + activeSiteDomain );
	};

	return (
		<div className="main theme-setup" role="main">
			{ site && <QueryActiveTheme siteId={ site.ID } /> }
			{ themeId && <QueryTheme siteId={ 'wpcom' } themeId={ themeId } /> }
			<HeaderCake onClick={ onBack }><h1>{ translate( 'Theme Setup' ) }</h1></HeaderCake>
			{ site && theme
				? <ThemeSetupCard
					onClickKeepContent={ onClickKeepContent }
					theme={ theme } />
				: <ThemeSetupPlaceholder /> }
		</div>
	);
};

ThemeSetup = localize( ThemeSetup );

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const themeId = site && getActiveTheme( state, site.ID );
	const theme = themeId && getTheme( state, 'wpcom', themeId );
	return {
		site,
		themeId,
		theme,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return {
		onClickKeepContent() {
			dispatch( openDialog( true ) );
		},
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( ThemeSetup );

