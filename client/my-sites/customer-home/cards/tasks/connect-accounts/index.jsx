import { isMobile } from '@automattic/viewport';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import connectSocialAccountsIllustration from 'calypso/assets/images/customer-home/illustration--task-connect-social-accounts.svg';
import QueryPublicizeConnections from 'calypso/components/data/query-publicize-connections';
import { TASK_CONNECT_ACCOUNTS } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const ConnectAccountsTask = ( { siteSlug } ) => {
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
				taskId={ TASK_CONNECT_ACCOUNTS }
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
