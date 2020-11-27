/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { TASK_PODCASTING } from 'calypso/my-sites/customer-home/cards/constants';
import podcastingIllustration from 'calypso/assets/images/customer-home/illustration--task-podcasting.svg';

const Podcasting = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Grow your audience with a podcast' ) }
			description={ translate(
				`Easily turn your blog into a podcast with Anchor — the world's biggest podcasting platform.`
			) }
			actionText={ translate( 'Get started' ) }
			// TODO replace with more appropriate URL as discussed in 320-gh-dotcom-manage
			actionUrl={ `https://anchor.fm` }
			illustration={ podcastingIllustration }
			taskId={ TASK_PODCASTING }
		/>
	);
};

export default Podcasting;
