/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import SingleTask from '../single-task';

const ConnectAccountsTask = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<>
			<QueryPublicizeConnections selectedSite />
			<SingleTask
				title={ translate( 'Drive traffic to your site' ) }
				description={ translate(
					'Integrate your site with social media to automatically post your content and drive traffic to your site.'
				) }
				actionText={ translate( 'Connect accounts' ) }
				actionUrl={
					isMobile()
						? `/marketing/connections/${ siteSlug }`
						: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`
				}
				illustration="/calypso/images/stats/tasks/social-links.svg"
				timing={ 3 }
				dismissalPreferenceName="home-task-connect-accounts"
			/>
		</>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( ConnectAccountsTask );
