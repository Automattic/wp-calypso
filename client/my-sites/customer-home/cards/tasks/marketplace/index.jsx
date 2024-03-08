import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import announcementImage from 'calypso/assets/images/marketplace/diamond.svg';
import { TASK_MARKETPLACE } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const Marketplace = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Task
			title={ translate( 'Buy the best plugins' ) }
			description={ translate(
				"Now you can purchase plugins right on WordPress.com to extend your website's capabilities."
			) }
			actionText={ translate( "Let's explore!" ) }
			actionUrl={ `/plugins/${ siteSlug }` }
			illustration={ announcementImage }
			taskId={ TASK_MARKETPLACE }
		/>
	);
};

export default Marketplace;
