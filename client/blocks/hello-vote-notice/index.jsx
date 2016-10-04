/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { mapValues } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { canCurrentUser } from 'state/current-user/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isSiteSection, getSectionName, getSelectedSiteId } from 'state/ui/selectors';
import { getPreference, hasReceivedRemotePreferences } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';
import { withAnalytics, bumpStat } from 'state/analytics/actions';

function HelloVoteNotice( props ) {
	const { applicableSection, canManageOptions, siteSlug, hasDismissed, preferencesReceived } = props;
	if ( ! applicableSection || ! canManageOptions || ! siteSlug || hasDismissed || ! preferencesReceived ) {
		return null;
	}

	const { translate, onActionClick, onDismiss } = props;
	return (
		<Notice
			status="is-info"
			text={ translate( 'Encourage your US-based visitors to register to vote by adding a subtle prompt to your site' ) }
			onDismissClick={ onDismiss }>
			<NoticeAction
				onClick={ onActionClick }
				href={ `/settings/general/${ siteSlug }` }>
				{ translate( 'Manage Settings' ) }
			</NoticeAction>
		</Notice>
	);
}

HelloVoteNotice.propTypes = {
	translate: PropTypes.func,
	applicableSection: PropTypes.bool,
	canManageOptions: PropTypes.bool,
	siteSlug: PropTypes.string,
	hasDismissed: PropTypes.bool,
	preferencesReceived: PropTypes.bool,
	onActionClick: PropTypes.func,
	onDismiss: PropTypes.func
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			applicableSection: isSiteSection( state ) && 'settings' !== getSectionName( state ),
			canManageOptions: canCurrentUser( state, selectedSiteId, 'manage_options' ),
			siteSlug: getSiteSlug( state, selectedSiteId ),
			hasDismissed: getPreference( state, 'helloVoteNoticeDismissed' ),
			preferencesReceived: hasReceivedRemotePreferences( state )
		};
	},
	( dispatch ) => {
		return mapValues( {
			onActionClick: 'calypso-opt-in',
			onDismiss: 'calypso-dismiss'
		}, ( statValue ) => () => dispatch( withAnalytics(
			bumpStat( 'hello-vote', statValue ),
			savePreference( 'helloVoteNoticeDismissed', true )
		) ) );
	}
)( localize( HelloVoteNotice ) );
