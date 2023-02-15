import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import siteCopyIllustration from 'calypso/assets/images/customer-home/illustration--import-complete.svg';
import { useSiteCopy } from 'calypso/landing/stepper/hooks/use-site-copy';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { navigate } from 'calypso/lib/navigate';
import { TASK_SITE_RESUME_COPY } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSite, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const SiteResumeCopy = ( { siteSlug, sourceSite, sourceSiteSlug } ) => {
	const translate = useTranslate();
	const [ isAddingProducts, setIsAddingProducts ] = useState( false );
	const { resumeSiteCopy } = useSiteCopy( sourceSite );

	return (
		<Task
			actionBusy={ isAddingProducts }
			isUrgent
			title={ translate( 'Ready to finish copying your site?' ) }
			description={ preventWidows(
				translate(
					'Your copied site is almost there. You can finish setting it up any time you’re ready.'
				)
			) }
			actionText={ translate( 'Finish setting it up' ) }
			actionOnClick={ async () => {
				recordTracksEvent( 'calypso_resume_copy_site_click' );
				setIsAddingProducts( true );
				await resumeSiteCopy( siteSlug );
				navigate(
					`/setup/copy-site/resuming?sourceSlug=${ sourceSiteSlug }&siteSlug=${ siteSlug }`
				);
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
