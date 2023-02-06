import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import siteCopyIllustration from 'calypso/assets/images/customer-home/illustration--import-complete.svg';
import { useSiteCopy } from 'calypso/landing/stepper/hooks/use-site-copy';
import { preventWidows } from 'calypso/lib/formatting';
import { TASK_SITE_RESUME_COPY } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSite, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const SiteResumeCopy = ( { siteSlug, sourceSite, sourceSiteSlug } ) => {
	const translate = useTranslate();
	const { startSiteCopy } = useSiteCopy( sourceSite );

	return (
		<Task
			isUrgent
			title={ translate( 'Ready to finish copying your site?' ) }
			description={ preventWidows(
				translate(
					'Your copied site is almost there. You can finish setting it up any time you’re ready.'
				)
			) }
			actionText={ translate( 'Finish setting it up' ) }
			actionUrl={ `/setup/copy-site?sourceSlug=${ sourceSiteSlug }&siteSlug=${ siteSlug }` }
			actionOnClick={ () => {
				startSiteCopy( 'calypso_resume_copy_site_click' );
			} }
			illustration={ siteCopyIllustration }
			taskId={ TASK_SITE_RESUME_COPY }
		/>
	);
};

const mapStateToProps = ( state ) => {
	const sourceSiteSlug = getSiteOption( state, getSelectedSiteId( state ), 'site_source_slug' );
	return {
		siteSlug: getSelectedSiteSlug( state ),
		sourceSite: getSite( state, sourceSiteSlug ),
		sourceSiteSlug,
	};
};

export default connect( mapStateToProps )( SiteResumeCopy );
