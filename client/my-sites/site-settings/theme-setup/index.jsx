import { localize } from 'i18n-calypso';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryTheme from 'calypso/components/data/query-theme';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { toggleDialog } from 'calypso/state/theme-setup/actions';
import { getActiveTheme, getTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ThemeSetupCard from './theme-setup-card';
import ThemeSetupPlaceholder from './theme-setup-placeholder';

import './style.scss';

class ThemeSetup extends Component {
	componentDidUpdate( prevProps ) {
		const { siteIsJetpack, siteId } = this.props;

		if ( siteId !== prevProps.siteId && siteIsJetpack ) {
			this.redirectToGeneral();
		}
	}

	redirectToGeneral = () => {
		const { siteSlug } = this.props;
		page.redirect( '/settings/general/' + siteSlug );
	};

	render() {
		const { siteId, theme, themeId, translate } = this.props;

		return (
			<Main className="theme-setup">
				{ siteId && <QueryActiveTheme siteId={ siteId } /> }
				{ themeId && <QueryTheme siteId="wpcom" themeId={ themeId } /> }

				<HeaderCake onClick={ this.redirectToGeneral }>
					<h1>{ translate( 'Theme Setup' ) }</h1>
				</HeaderCake>

				{ siteId && theme ? (
					<ThemeSetupCard onClick={ this.props.toggleDialog } theme={ theme } />
				) : (
					<ThemeSetupPlaceholder />
				) }
			</Main>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const siteSlug = getSelectedSiteSlug( state ) || '';
	const themeId = siteId && getActiveTheme( state, siteId );
	const theme = themeId && getTheme( state, 'wpcom', themeId );
	return {
		siteId,
		siteIsJetpack,
		siteSlug,
		themeId,
		theme,
	};
};

export default connect( mapStateToProps, { toggleDialog } )( localize( ThemeSetup ) );
