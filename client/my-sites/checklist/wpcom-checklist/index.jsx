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
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { isBlockEditorSectionInTest } from 'lib/signup/page-builder';

class WpcomChecklist extends Component {
	static propTypes = {
		designType: PropTypes.oneOf( [ 'blog', 'page', 'portfolio', 'store' ] ),
		siteId: PropTypes.number,
		taskStatuses: PropTypes.object,
		viewMode: PropTypes.oneOf( [ 'checklist', 'navigation', 'notification', 'prompt' ] ),
	};

	static defaultProps = {
		viewMode: 'checklist',
	};

	setNotification = value => {
		if ( this.props.setNotification && this.props.viewMode === 'notification' ) {
			this.props.setNotification( value );
		}
	};

	render() {
		const { shouldRender, ...ownProps } = this.props;

		if ( ! shouldRender ) {
			return null;
		}

		// Asynchronously load and render component with passed props.
		return <AsyncLoad require="my-sites/checklist/wpcom-checklist/component.jsx" { ...ownProps } />;
	}
}

function shouldChecklistRender( viewMode, isEligibleForChecklist, taskList, isSectionEligible ) {
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

	return true;
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
	const siteIsUnlaunched = isUnlaunchedSite( state, siteId );
	const taskList = getTaskList( {
		taskStatuses,
		designType,
		siteIsUnlaunched,
		siteSegment,
		siteVerticals,
	} );

	const { viewMode } = ownProps;

	return {
		shouldRender: shouldChecklistRender(
			viewMode,
			isEligibleForChecklist,
			taskList,
			isSectionEligible,
			siteId
		),
	};
} )( WpcomChecklist );
