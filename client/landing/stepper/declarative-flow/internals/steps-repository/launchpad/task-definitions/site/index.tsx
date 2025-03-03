import { OnboardActions, SiteActions } from '@automattic/data-stores';
import { Task } from '@automattic/launchpad';
import {
	isBlogOnboardingFlow,
	isDesignFirstFlow,
	isStartWritingFlow,
	replaceProductsInCart,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { isDomainUpsellCompleted } from '../../task-helper';
import { TaskAction, TaskContext } from '../../types';

const getCompletedTasks = ( tasks: Task[] ): Record< string, boolean > =>
	tasks.reduce(
		( acc, cur ) => ( {
			...acc,
			[ cur.id ]: cur.completed,
		} ),
		{}
	);

const getCompletedInfo = ( tasks: Task[], flow: string ): Record< string, boolean > => {
	const completedTasks = getCompletedTasks( tasks );
	return {
		firstPostPublished: completedTasks.first_post_published,
		planCompleted: completedTasks.plan_completed,
		setupBlogCompleted: completedTasks.setup_blog || ! isStartWritingFlow( flow ),
	};
};

const getIsLaunchSiteTaskDisabled = ( flow: string, context: TaskContext ) => {
	const { tasks, site, checklistStatuses } = context;
	const { firstPostPublished, planCompleted, setupBlogCompleted } = getCompletedInfo( tasks, flow );

	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses! );

	if ( isStartWritingFlow( flow ) ) {
		return ! ( firstPostPublished && planCompleted && domainUpsellCompleted && setupBlogCompleted );
	}

	if ( isDesignFirstFlow( flow ) ) {
		return ! ( planCompleted && domainUpsellCompleted && setupBlogCompleted );
	}

	return false;
};

const getOnboardingCartItems = ( context: TaskContext ) => {
	const { planCartItem, domainCartItem, productCartItems } = context;

	return [ planCartItem, domainCartItem, ...( productCartItems ?? [] ) ].filter(
		Boolean
	) as MinimalRequestCartProduct[];
};

const getLaunchSiteTaskTitle = ( task: Task, flow: string, context: TaskContext ) => {
	const { tasks } = context;
	const onboardingCartItems = getOnboardingCartItems( context );
	const isSupportedFlow = isBlogOnboardingFlow( flow );
	const { planCompleted } = getCompletedInfo( tasks, flow );
	if ( isSupportedFlow && planCompleted && onboardingCartItems.length ) {
		return translate( 'Checkout and launch' );
	}

	return task.title;
};

const completeLaunchSiteTask = async ( task: Task, flow: string, context: TaskContext ) => {
	const { site, siteSlug, submit } = context;
	if ( ! site?.ID ) {
		return;
	}

	const onboardingCartItems = getOnboardingCartItems( context );
	const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE ) as OnboardActions;

	setPendingAction( async () => {
		// If user selected products during onboarding, update cart and redirect to checkout
		if ( onboardingCartItems.length ) {
			setProgressTitle( __( 'Directing to checkout' ) );
			await replaceProductsInCart( siteSlug as string, onboardingCartItems );
			goToCheckout( {
				flowName: flow ?? '',
				stepName: 'launchpad',
				siteSlug: siteSlug ?? '',
				destination: `/setup/${ flow }/site-launch?siteSlug=${ siteSlug }`,
				cancelDestination: `/home/${ siteSlug }`,
			} );
			return { goToCheckout: true };
		}

		// Launch the site or blog immediately if no items in cart
		const { launchSite } = dispatch( SITE_STORE ) as SiteActions;
		setProgressTitle(
			task.id === 'blog_launched' ? __( 'Launching blog' ) : __( 'Launching website' )
		);

		await launchSite( site.ID );
		// Waits for half a second so that the loading screen doesn't flash away too quickly
		await new Promise( ( res ) => setTimeout( res, 500 ) );

		return {
			siteSlug,
			// For the blog onboarding flow.
			isLaunched: true,
			// For the general onboarding flow.
			goToHome: true,
		};
	} );

	submit?.();
};

export const getSiteLaunchedTask: TaskAction = ( task, flow, context ): Task => {
	return {
		...task,
		isLaunchTask: true,
		title: getLaunchSiteTaskTitle( task, flow, context ),
		disabled: getIsLaunchSiteTaskDisabled( flow, context ),
		actionDispatch: () => completeLaunchSiteTask( task, flow, context ),
		useCalypsoPath: false,
	};
};

export const getBlogLaunchedTask: TaskAction = ( task, flow, context ): Task => {
	return {
		...task,
		isLaunchTask: true,
		title: getLaunchSiteTaskTitle( task, flow, context ),
		disabled: getIsLaunchSiteTaskDisabled( flow, context ),
		actionDispatch: () => completeLaunchSiteTask( task, flow, context ),
		useCalypsoPath: false,
	};
};

export const actions = {
	site_launched: getSiteLaunchedTask,
	blog_launched: getBlogLaunchedTask,
};
