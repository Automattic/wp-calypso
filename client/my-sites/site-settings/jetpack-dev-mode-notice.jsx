import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const JetpackDevModeNotice = ( { isJetpackSiteInDevMode, siteId, siteIsJetpack, translate } ) => {
	if ( ! siteIsJetpack || ! isJetpackSiteInDevMode ) {
		return null;
	}

	return (
		<div className="site-settings__jetpack-dev-mode-notice">
			<QueryJetpackConnection siteId={ siteId } />

			{ isJetpackSiteInDevMode && (
				<Notice
					text={ translate(
						'Some features are disabled because your site is in development mode.'
					) }
					showDismiss={ false }
				>
					<NoticeAction href="https://jetpack.com/support/development-mode/" external>
						{ translate( 'Learn more' ) }
					</NoticeAction>
				</Notice>
			) }
		</div>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );

	return {
		isJetpackSiteInDevMode: isJetpackSiteInDevelopmentMode( state, siteId ),
		siteId,
		siteIsJetpack,
	};
} )( localize( JetpackDevModeNotice ) );
