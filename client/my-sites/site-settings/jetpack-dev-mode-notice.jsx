/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSiteInDevelopmentMode } from 'state/selectors';

const JetpackDevModeNotice = ( {
	isJetpackSiteInDevMode,
	siteId,
	translate
} ) => {
	return (
		<div>
			<QueryJetpackConnection siteId={ siteId } />

			{
				isJetpackSiteInDevMode &&
				<Notice
					text={ translate( 'Some features are disabled because your site is in development mode.' ) }
					showDismiss={ false }
				>
					<NoticeAction href={ 'https://jetpack.com/support/development-mode/' } external>
						{ translate( 'Learn more' ) }
					</NoticeAction>
				</Notice>
			}
		</div>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			isJetpackSiteInDevMode: isJetpackSiteInDevelopmentMode( state, siteId ),
		};
	}
)( localize( JetpackDevModeNotice ) );
