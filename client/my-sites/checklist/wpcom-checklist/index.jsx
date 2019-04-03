/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getTaskList } from './wpcom-task-list';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import { getSelectedSiteId, isSiteSection } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import AsyncLoad from 'components/async-load';
import { getNeverShowBannerStatus } from 'my-sites/checklist/wpcom-checklist/checklist-banner/never-show';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { isBlockEditorSectionInTest } from 'lib/signup/page-builder';

class WpcomChecklist extends Component {
	static propTypes = {
		designType: PropTypes.oneOf( [ 'blog', 'page', 'portfolio', 'store' ] ),
		siteId: PropTypes.number,
		taskStatuses: PropTypes.object,
		viewMode: PropTypes.oneOf( [ 'checklist', 'banner', 'navigation', 'notification', 'prompt' ] ),
	};

	static defaultProps = {
		viewMode: 'checklist',
	};

	componentDidMount() {
		this.setNotification( this.props.shouldShowNotification );
	}

	componentDidUpdate() {
		this.setNotification( this.props.shouldShowNotification );
	}

	setNotification = value => {
		if ( this.props.setNotification && this.props.viewMode === 'notification' ) {
			this.props.setNotification( value );
		}
	};

	render() {
		const { shouldRender, shouldShowNotification, ...ownProps } = this.props;

		if ( ! shouldRender ) {
			return null;
		}

		// Asynchronously load and render component with passed props.
		return <AsyncLoad require="my-sites/checklist/wpcom-checklist/component.jsx" { ...ownProps } />;
	}
}

function shouldChecklistRender(
	viewMode,
	isEligibleForChecklist,
	taskList,
	isSectionEligible,
	siteId
) {
	// Render nothing in notification mode.
	if ( viewMode === 'notification' ) {
		return false;
	}

	// Render nothing if not eligible for checklist. Exception: checklist mode.
	if ( ! isEligibleForChecklist && viewMode !== 'checklist' ) {
		return false;
	}

	// Render nothing if all tasks are completed. Exception: checklist mode.
	if ( ! taskList.getFirstIncompleteTask && viewMode !== 'checklist' ) {
		return false;
	}

	// Render nothing in navigation mode if the current section is not site-specific.
	if ( ! isSectionEligible && viewMode === 'navigation' ) {
		return false;
	}

	// Render nothing in banner mode if "never show banner" is set.
	if ( getNeverShowBannerStatus( siteId ) && viewMode === 'banner' ) {
		return false;
	}

	return true;
}

function shouldChecklistShowNotification(
	taskList,
	storedTask,
	isEligibleForChecklist,
	isSectionEligible
) {
	const firstIncomplete = taskList && taskList.getFirstIncompleteTask();

	if (
		firstIncomplete &&
		( storedTask !== firstIncomplete.id || storedTask === null ) &&
		isEligibleForChecklist &&
		isSectionEligible
	) {
		return true;
	}

	return false;
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const designType = getSiteOption( state, siteId, 'design_type' );
	const isEligibleForChecklist = isEligibleForDotcomChecklist( state, siteId );
	const isSectionEligible = isSiteSection( state ) && ! isBlockEditorSectionInTest( state );
	const siteChecklist = getSiteChecklist( state, siteId );
	const siteSegment = get( siteChecklist, 'segment' );
	const siteVerticals = get( siteChecklist, 'vertical' );
	const taskStatuses = get( siteChecklist, 'tasks' );
	const isSiteUnlaunched = isUnlaunchedSite( state, siteId );
	const taskList = getTaskList( {
		taskStatuses,
		designType,
		isSiteUnlaunched,
		siteSegment,
		siteVerticals,
	} );

	const { viewMode, storedTask } = ownProps;

	return {
		shouldRender: shouldChecklistRender(
			viewMode,
			isEligibleForChecklist,
			taskList,
			isSectionEligible,
			siteId
		),
		shouldShowNotification: shouldChecklistShowNotification(
			taskList,
			storedTask,
			isEligibleForChecklist,
			isSectionEligible
		),
	};
} )( WpcomChecklist );
