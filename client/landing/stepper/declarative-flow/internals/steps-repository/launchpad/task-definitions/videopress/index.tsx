import { FEATURE_VIDEO_UPLOADS, planHasFeature } from '@automattic/calypso-products';
import { isVideoPressFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { TaskAction } from '../../types';

export const getVideoPressUploadTask: TaskAction = ( task, flow, context ) => {
	const { site, siteSlug, tasks, planCartItem } = context;
	const homePageId = site?.options?.page_on_front;
	// send user to Home page editor, fallback to FSE if page id is not known
	const productSlug = planCartItem?.product_slug ?? site?.plan?.product_slug;

	const isVideoPressFlowWithUnsupportedPlan =
		isVideoPressFlow( flow ) && ! planHasFeature( productSlug as string, FEATURE_VIDEO_UPLOADS );

	const completedTasks: Record< string, boolean > = tasks.reduce(
		( acc, cur ) => ( {
			...acc,
			[ cur.id ]: cur.completed,
		} ),
		{}
	);
	const videoPressUploadCompleted = completedTasks.video_uploaded;

	const launchpadUploadVideoLink = homePageId
		? `/page/${ siteSlug }/${ homePageId }`
		: addQueryArgs( `/site-editor/${ siteSlug }`, {
				canvas: 'edit',
		  } );

	return {
		...task,
		actionUrl: launchpadUploadVideoLink,
		disabled: isVideoPressFlowWithUnsupportedPlan || videoPressUploadCompleted,
		calypso_path: launchpadUploadVideoLink,
		useCalypsoPath: true,
	};
};

export const actions = {
	videopress_upload: getVideoPressUploadTask,
};
