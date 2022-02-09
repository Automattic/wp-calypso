import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import findDomainIllustration from 'calypso/assets/images/customer-home/illustration--task-find-domain.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { TASK_FIND_DOMAIN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const FindDomain = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Look more professional' ) }
			description={ preventWidows(
				translate(
					"Get a custom domain and show the world you're serious. Sites with custom domains look more professional and rank higher in search engine results."
				)
			) }
			actionText={ translate( 'Find a domain' ) }
			actionUrl={ `/domains/add/${ siteSlug }` }
			illustration={ findDomainIllustration }
			timing={ 10 }
			taskId={ TASK_FIND_DOMAIN }
		/>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( FindDomain );
