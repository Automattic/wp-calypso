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
import QueryGeo from 'components/data/query-geo';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import TrackComponentView from 'lib/analytics/track-component-view';
import { canCurrentUser } from 'state/current-user/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isSiteSection, getSectionName, getSelectedSiteId } from 'state/ui/selectors';
import { getPreference, hasReceivedRemotePreferences } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';
import { withAnalytics, bumpStat } from 'state/analytics/actions';
import { getGeoCountry } from 'state/geo/selectors';

function HelloVoteNotice( { translate, visible, siteSlug, onDismiss, onActionClick } ) {
	return (
		<div>
			<QueryGeo />
			{ visible && [
				<TrackComponentView
					key="impression"
					statGroup="hello-vote"
					statName="calypso-notice-impression" />,
				<Notice
					key="notice"
					status="is-info"
					text={ translate( 'Encourage your US-based visitors to register to vote by adding a subtle prompt to your site' ) }
					onDismissClick={ onDismiss }>
					<NoticeAction
						onClick={ onActionClick }
						href={ `/settings/general/${ siteSlug }` }>
						{ translate( 'Manage Settings' ) }
					</NoticeAction>
				</Notice>
			] }
		</div>
	);
}

HelloVoteNotice.propTypes = {
	translate: PropTypes.func,
	visible: PropTypes.bool,
	siteSlug: PropTypes.string,
	onActionClick: PropTypes.func,
	onDismiss: PropTypes.func
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, selectedSiteId );

		return {
			siteSlug,
			visible: (
				siteSlug &&
				isSiteSection( state ) &&
				'settings' !== getSectionName( state ) &&
				canCurrentUser( state, selectedSiteId, 'manage_options' ) &&
				hasReceivedRemotePreferences( state ) &&
				! getPreference( state, 'helloVoteNoticeDismissed' ) &&
				'United States' === getGeoCountry( state )
			)
		};
	},
	( dispatch ) => {
		return mapValues( {
			onActionClick: 'calypso-notice-opt-in',
			onDismiss: 'calypso-notice-dismiss'
		}, ( statValue ) => () => dispatch( withAnalytics(
			bumpStat( 'hello-vote', statValue ),
			savePreference( 'helloVoteNoticeDismissed', true )
		) ) );
	}
)( localize( HelloVoteNotice ) );
