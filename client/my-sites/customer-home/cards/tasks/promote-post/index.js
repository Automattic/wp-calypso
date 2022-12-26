import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import {
	loadDSPWidgetJS,
	recordDSPEntryPoint,
	usePromoteWidget,
	PromoteWidgetStatus,
} from 'calypso/lib/promote-post';
import { TASK_PROMOTE_POST } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const PromotePost = () => {
	const translate = useTranslate();
	const showPromotePost = usePromoteWidget() === PromoteWidgetStatus.ENABLED;
	const dispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const trackDspAction = async () => {
		dispatch( recordDSPEntryPoint( 'myhome_tasks-swipeable' ) );
	};

	useEffect( () => {
		loadDSPWidgetJS();
	}, [] );

	return (
		<>
			{ showPromotePost && (
				<Task
					title={ translate( 'Reach new readers and customers with Blaze' ) }
					description={ translate(
						'For as low as $5, use WordPress Blaze to increase your reach by promoting your pages or posts to the larger WordPress.com community of blogs and sites.'
					) }
					actionText={ translate( 'Get started' ) }
					actionUrl={ `/advertising/${ selectedSiteSlug }` }
					actionOnClick={ trackDspAction }
					completeOnStart={ false }
					illustration={ megaphoneIllustration }
					taskId={ TASK_PROMOTE_POST }
				/>
			) }
		</>
	);
};

export default PromotePost;
