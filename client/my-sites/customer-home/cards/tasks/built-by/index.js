import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import announcementImage from 'calypso/assets/images/marketplace/diamond.svg';
import { TASK_BUILT_BY } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const BuiltBy = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );

	return (
		<Task
			title={ translate( 'Hire experts to build your website!' ) }
			description={ translate(
				'We’re here to help – whether you want to create an online store, redesign your website, migrate your site or simply want to showcase your work. Every site is unique, and has unique needs. So, to get started, let us know about your site’s needs: Click on the link below and tell us some details about your project or business.'
			) }
			actionText={ translate( "Let's explore!" ) }
			actionUrl={ `/plugins/${ siteSlug }` }
			illustration={ announcementImage }
			taskId={ TASK_BUILT_BY }
		/>
	);
};

export default BuiltBy;
