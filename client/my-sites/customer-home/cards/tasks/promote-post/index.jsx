import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import blazeIllustration from 'calypso/assets/images/customer-home/illustration--blaze.svg';
import { usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import useAdvertisingUrl from 'calypso/my-sites/advertising/useAdvertisingUrl';
import { TASK_PROMOTE_POST } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const PromotePost = () => {
	const translate = useTranslate();
	const showPromotePost = usePromoteWidget() === PromoteWidgetStatus.ENABLED;
	const dispatch = useDispatch();
	const advertisingUrl = useAdvertisingUrl();
	const trackDspAction = async () => {
		dispatch( recordTracksEvent( 'calypso_customer_home_tasks_swipeable_blaze' ) );
	};

	PromotePost.isDisabled = ! showPromotePost;

	return (
		<>
			{ showPromotePost && (
				<Task
					title={ translate( 'Promote your content with Blaze' ) }
					description={ translate(
						'Grow your audience by promoting your content with Blaze campaigns. Reach interested users across millions of sites on Tumblr and WordPress.com.'
					) }
					actionText={ translate( 'Create campaign' ) }
					actionUrl={ advertisingUrl }
					actionOnClick={ trackDspAction }
					completeOnStart={ false }
					illustration={ blazeIllustration }
					taskId={ TASK_PROMOTE_POST }
				/>
			) }
		</>
	);
};

export default PromotePost;
