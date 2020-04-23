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
import Task from '../task';

const ConnectAccountsTask = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<>
			<QueryPublicizeConnections selectedSite />
			<Task
				title={ translate( 'Look more professional' ) }
				description={ translate(
					"Get a custom domain and show the world you're serious. Sites with custom domains look more professional and rank higher in search engine results."
				) }
				actionText={ translate( 'Find a domain' ) }
				actionUrl={
					isMobile()
						? `/marketing/connections/${ siteSlug }`
						: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`
				}
				illustration="/calypso/images/stats/tasks/social-links.svg"
				timing={ 10 }
				taskId="connect-accounts"
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
