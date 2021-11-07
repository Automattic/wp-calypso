import { useTranslate } from 'i18n-calypso';
import podcastingIllustration from 'calypso/assets/images/customer-home/illustration--task-podcasting.svg';
import { TASK_PODCASTING } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const Podcasting = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Grow your audience with a podcast' ) }
			description={ translate(
				`Easily turn your blog into a podcast with Anchor — the world's biggest podcasting platform.`
			) }
			actionText={ translate( 'Create an Anchor account' ) }
			actionUrl={ `https://anchor.fm/wordpressdotcom` }
			illustration={ podcastingIllustration }
			taskId={ TASK_PODCASTING }
		/>
	);
};

export default Podcasting;
