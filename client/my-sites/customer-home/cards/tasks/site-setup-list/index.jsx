/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { Card, Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelCta from 'components/action-panel/cta';
import CardHeading from 'components/card-heading';
import { getTaskList } from 'lib/checklist';
import Gridicon from 'components/gridicon';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getSiteOption } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import NavItem from './nav-item';

/**
 * Style dependencies
 */
import './style.scss';

const getTaskCopy = ( task, taskOptions ) => {
	switch ( task ) {
		case 'domain_verified':
			return {
				duration: translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ),
				title: translate( 'Verify the email address for your domains' ),
				description: translate(
					'We need to check your contact information to make sure you can be reached. Please verify your details using the email we sent you, or your domain will stop working.'
				),
			};
		case 'email_verified':
			return {
				duration: translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ),
				title: translate( 'Confirm your email address' ),
				description: translate(
					'Please click the link in the email we sent to %(email)s.' +
						'Typo in your email address? {{changeButton}}Change it here{{/changeButton}}.',
					{
						args: {
							email: taskOptions?.userEmail,
						},
						components: {
							br: <br />,
							changeButton: <a href="/me/account" />,
						},
					}
				),
				//TODO: looks like there's some more complicated text states here
				actionText: translate( 'Verify email' ),
			};
		case 'blogname_set':
			return {
				duration: translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ),
				title: translate( 'Name your site' ),
				description: translate(
					'Give your new site a title to let people know what your site is about. ' +
						'A good title introduces your brand and the primary topics of your site.'
				),
				actionText: translate( 'Name your site' ),
				actionUrl: null,
			};
		case 'mobile_app_installed':
			return {
				duration: translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ),
				title: translate( 'Get the WordPress app' ),
				description: translate(
					'Download the WordPress app to your mobile device to manage your site and follow your stats on the go.'
				),
				actionText: translate( 'Download mobile app' ),
			};
		case 'site_launched':
			return {
				duration: translate( '%d minute', '%d minutes', { count: 1, args: [ 1 ] } ),
				title: translate( 'Launch your site' ),
				description: translate(
					"Your site is private and only visible to you. When you're ready, launch your site to make it public."
				),
				actionText: translate( 'Launch site' ),
			};
		case 'front_page_updated':
			return {
				duration: translate( '%d minute', '%d minutes', { count: 20, args: [ 20 ] } ),
				title: translate( 'Update your Home page' ),
				description: translate(
					"We’ve created the basics, now it's time for you to update the images and text. Make a great first impression. Everything you do can be changed anytime."
				),
				actionText: translate( 'Create a menu' ),
			};
		case 'site_menu_updated':
			return {
				duration: translate( '%d minute', '%d minutes', { count: 10, args: [ 10 ] } ),
				title: translate( 'Create a site menu' ),
				description: translate(
					'Building an effective navigation menu makes it easier for someone to find what they’re looking for and improve search engine rankings.'
				),
				actionText: translate( 'Create a menu' ),
			};
		default:
			return {};
	}
};

const SiteSetupList = ( { tasks } ) => {
	const [ currentTask, setCurrentTask ] = useState( null );

	useEffect( () => {
		if ( tasks.length ) {
			setCurrentTask( tasks[ 0 ].id );
		}
	}, [ tasks ] );

	if ( ! tasks.length || ! currentTask ) {
		return null;
	}

	const taskCopy = getTaskCopy( currentTask );

	return (
		<Card className="site-setup-list">
			<div className="site-setup-list__nav">
				<CardHeading>{ translate( 'Site setup' ) }</CardHeading>
				{ tasks.map( ( task ) => (
					<NavItem
						key={ task.id }
						text={ getTaskCopy( task.id ).title }
						isCompleted={ task.isCompleted }
						isCurrent={ task.id === currentTask }
						onClick={ () => setCurrentTask( task.id ) }
					/>
				) ) }
			</div>
			<ActionPanel className="site-setup-list__task task">
				<ActionPanelBody>
					<div className="site-setup-list__task task__text">
						<div className="site-setup-list__task task__timing">
							<Gridicon icon="time" size={ 18 } />
							<p>{ taskCopy.duration }</p>
						</div>
						<ActionPanelTitle>{ getTaskCopy( currentTask ).title }</ActionPanelTitle>
						<p className="site-setup-list__task task__description">{ taskCopy.description }</p>
						<ActionPanelCta>
							<Button
								className="site-setup-list__task task__action"
								primary
								href={ taskCopy.actionUrl }
							>
								{ taskCopy.actionText }
							</Button>
						</ActionPanelCta>
					</div>
				</ActionPanelBody>
			</ActionPanel>
		</Card>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const designType = getSiteOption( state, siteId, 'design_type' );
	const siteChecklist = getSiteChecklist( state, siteId );
	const siteSegment = siteChecklist?.segment;
	const siteVerticals = siteChecklist?.vertical;
	const taskStatuses = siteChecklist?.tasks;
	const siteIsUnlaunched = isUnlaunchedSite( state, siteId );
	const taskList = getTaskList( {
		taskStatuses,
		designType,
		siteIsUnlaunched,
		siteSegment,
		siteVerticals,
	} );

	return {
		tasks: taskList.getAll(),
	};
} )( SiteSetupList );
