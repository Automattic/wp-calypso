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
import QueryPublicizeConnections from 'calypso/components/data/query-publicize-connections';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

/**
 * Image dependencies
 */
import connectSocialAccountsIllustration from 'calypso/assets/images/customer-home/illustration--task-connect-social-accounts.svg';

const ConnectAccountsTask = ( { card, siteSlug } ) => {
	const translate = useTranslate();

	return (
		<>
			<QueryPublicizeConnections selectedSite />
			<Task
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
				illustration={ connectSocialAccountsIllustration }
				timing={ 3 }
				taskId={ card }
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
