/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import CardHeading from 'components/card-heading';
import { getTaskList } from 'lib/checklist';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getSiteOption } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import NavItem from './nav-item';

/**
 * Style dependencies
 */
import './style.scss';

const getTaskCopy = ( task ) => {
	switch ( task ) {
		case 'domain_verified':
			return {
				title: translate( 'Verify the email address for your domains' ),
			};
		case 'email_verified':
			return {
				title: translate( 'Confirm your email address' ),
			};
		case 'blogname_set':
			return {
				title: translate( 'Name your site' ),
				description: translate(
					'Give your new site a title to let people know what your site is about. ' +
						'A good title introduces your brand and the primary topics of your site.'
				),
			};
		case 'mobile_app_installed':
			return {
				title: translate( 'Get the WordPress app' ),
			};
		case 'site_launched':
			return {
				title: translate( 'Launch your site' ),
			};
		case 'front_page_updated':
			return {
				title: translate( 'Update your Home page' ),
			};
		case 'site_menu_updated':
			return {
				title: translate( 'Create a site menu' ),
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

	return (
		<Card className="site-setup-list">
			<div className="site-setup-list__nav">
				<CardHeading>{ translate( 'Site setup' ) }</CardHeading>
				{ tasks.map( ( task ) => (
					<NavItem
						key={ task.id }
						text={ getTaskCopy( task.id )?.title }
						isCompleted={ task.isCompleted }
						isCurrent={ task.id === currentTask }
						onClick={ () => setCurrentTask( task.id ) }
					/>
				) ) }
			</div>
			<ActionPanel className="site-setup-list__task task">
				<ActionPanelBody>
					<ActionPanelTitle>{ getTaskCopy( currentTask )?.title }</ActionPanelTitle>
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
