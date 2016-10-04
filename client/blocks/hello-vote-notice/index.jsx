/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { getSiteSlug } from 'state/sites/selectors';
import { isSiteSection, getSelectedSiteId } from 'state/ui/selectors';
import { getPreference, hasReceivedRemotePreferences } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';

function HelloVoteNotice( props ) {
	const { siteSection, siteSlug, hasDismissed, preferencesReceived } = props;
	if ( ! siteSection || ! siteSlug || hasDismissed || ! preferencesReceived ) {
		return null;
	}

	const { translate, onDismiss } = props;
	return (
		<Notice
			status="is-info"
			text={ translate( 'Encourage your US-based visitors to register to vote by adding a subtle prompt to your site' ) }
			onDismissClick={ onDismiss }>
			<NoticeAction
				onClick={ onDismiss }
				href={ `/settings/general/${ siteSlug }` }>
				{ translate( 'Manage Settings' ) }
			</NoticeAction>
		</Notice>
	);
}

HelloVoteNotice.propTypes = {
	translate: PropTypes.func,
	siteSection: PropTypes.bool,
	siteSlug: PropTypes.string,
	hasDismissed: PropTypes.bool,
	preferencesReceived: PropTypes.bool,
	onDismiss: PropTypes.func
};

export default connect(
	( state ) => ( {
		siteSection: isSiteSection( state ),
		siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
		hasDismissed: getPreference( state, 'helloVoteNoticeDismissed' ),
		preferencesReceived: hasReceivedRemotePreferences( state )
	} ),
	( dispatch ) => ( {
		onDismiss: () => dispatch( savePreference( 'helloVoteNoticeDismissed', true ) )
	} )
)( localize( HelloVoteNotice ) );
