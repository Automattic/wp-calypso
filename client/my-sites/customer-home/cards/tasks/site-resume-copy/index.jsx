import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import siteCopyIllustration from 'calypso/assets/images/customer-home/illustration--import-complete.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { TASK_SITE_RESUME_COPY } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const SiteResumeCopy = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<Task
			isUrgent
			title={ translate( 'Resume copying your site' ) }
			description={ preventWidows(
				translate(
					'You didn’t finish copying your site, but don’t worry, we’ll guide you through the process when you are ready.'
				)
			) }
			actionText={ translate( 'Resume copying' ) }
			actionUrl={ `/setup/copy-site/${ siteSlug }` }
			illustration={ siteCopyIllustration }
			taskId={ TASK_SITE_RESUME_COPY }
		/>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( SiteResumeCopy );
