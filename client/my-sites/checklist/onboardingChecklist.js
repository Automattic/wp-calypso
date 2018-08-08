/** @format */
/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import Checklist from 'components/checklist';
import ConnectedItem from 'blocks/checklist/item';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import { isDesktop } from 'lib/viewport';

class OnboardingChecklist extends PureComponent {
	static propTypes = {
		checklistTasks: PropTypes.shape( {
			completed: PropTypes.bool,
		} ),
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static taskIds = new Set( [
		'site_created',
		'domain_selected',
		'blogname_set',
		'site_icon_set',
		'blogdescription_set',
		'avatar_uploaded',
		'contact_page_updated',
		'post_published',
		'jetpack_backups',
	] );

	render() {
		const { siteId, checklistTasks } = this.props;
		const TaskComponent = this.props.taskComponentType || ConnectedItem;

		const completedCount = reduce(
			checklistTasks,
			( count, { completed = false }, taskId ) =>
				completed && OnboardingChecklist.taskIds.has( taskId ) ? count + 1 : count,

			2 // 2 tasks are statically completed
		);

		return (
			<Checklist completedCount={ completedCount }>
				<TaskComponent
					siteId={ siteId }
					taskId="site_created"
					title="Create your site"
					description="This is where your adventure begins."
					completedTitle="You created your site"
					completed
				/>
				<TaskComponent
					siteId={ siteId }
					taskId="domain_selected"
					title="Pick a website address"
					description="Choose an address so people can find you on the internet."
					completedTitle="You picked a website address"
					completed
					image="/calypso/images/stats/tasks/domains.svg"
				/>
				<TaskComponent
					siteId={ siteId }
					taskId="blogname_set"
					title="Give your site a name"
					description="Give your site a descriptive name to entice visitors."
					duration="1 min"
					completedTitle="You updated your site title"
					completedButtonText="Edit"
					tourUrl="/settings/general/$siteSlug"
					image="/calypso/images/stats/tasks/personalize-your-site.svg"
					tourId="checklistSiteTitle"
				/>
				<TaskComponent
					siteId={ siteId }
					taskId="site_icon_set"
					title="Upload a site icon"
					description="Help people recognize your site in browser tabs — just like the WordPress.com W!"
					duration="1 min"
					completedTitle="You uploaded a site icon"
					completedButtonText="Change"
					tourUrl="/settings/general/$siteSlug"
					image="/calypso/images/stats/tasks/upload-icon.svg"
					tourId="checklistSiteIcon"
				/>
				<TaskComponent
					siteId={ siteId }
					taskId="blogdescription_set"
					title="Create a tagline"
					description="Pique readers’ interest with a little more detail about your site."
					duration="2 mins"
					completedTitle="You created a tagline"
					completedButtonText="Change"
					tourUrl="/settings/general/$siteSlug"
					image="/calypso/images/stats/tasks/create-tagline.svg"
					tourId="checklistSiteTagline"
				/>
				<TaskComponent
					siteId={ siteId }
					taskId="avatar_uploaded"
					title="Upload your profile picture"
					description="Who’s the person behind the site? Personalize your posts and comments with a custom profile picture."
					duration="2 mins"
					completedTitle="You uploaded a profile picture"
					completedButtonText="Change"
					tourUrl="/me"
					image="/calypso/images/stats/tasks/upload-profile-picture.svg"
					tourId="checklistUserAvatar"
				/>
				<TaskComponent
					siteId={ siteId }
					taskId="contact_page_updated"
					title="Personalize your Contact page"
					description="Encourage visitors to get in touch — a website is for connecting with people."
					duration="2 mins"
					completedTitle="You updated your Contact page"
					completedButtonText="Edit"
					image="/calypso/images/stats/tasks/contact.svg"
					tourUrl="/post/$siteSlug/2"
					tourId="checklistContactPage"
				/>
				<TaskComponent
					siteId={ siteId }
					taskId="post_published"
					title="Publish your first blog post"
					description="Introduce yourself to the world! That’s why you’re here."
					duration="10 mins"
					completedTitle="You published your first blog post"
					completedButtonText="Edit"
					tourUrl="/post/$siteSlug"
					image="/calypso/images/stats/tasks/first-post.svg"
					tourId="checklistPublishPost"
				/>
			</Checklist>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	checklistTasks: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
} ) )( OnboardingChecklist );

export function launchTask( { task, location, requestTour, siteSlug, track } ) {
	const checklist_name = 'new_blog';
	const url = task.url && task.url.replace( '$siteSlug', siteSlug );
	const tour = task.tour;

	if ( task.completed ) {
		if ( url ) {
			page( url );
		}
		return;
	}

	if ( ! tour && ! url ) {
		return;
	}

	track( 'calypso_checklist_task_start', {
		checklist_name,
		step_name: task.id,
		location,
	} );

	if ( url ) {
		page( url );
	}

	if ( tour && isDesktop() ) {
		requestTour( tour );
	}
}
