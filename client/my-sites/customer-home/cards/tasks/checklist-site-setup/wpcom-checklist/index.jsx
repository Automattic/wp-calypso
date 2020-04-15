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
import { getTaskList } from 'lib/checklist';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import AsyncLoad from 'components/async-load';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';

class WpcomChecklist extends Component {
	static propTypes = {
		designType: PropTypes.oneOf( [ 'blog', 'page', 'portfolio', 'store' ] ),
		siteId: PropTypes.number,
		taskStatuses: PropTypes.object,
		viewMode: PropTypes.oneOf( [ 'checklist' ] ),
	};

	static defaultProps = {
		viewMode: 'checklist',
	};

	render() {
		const { shouldRender, ...ownProps } = this.props;

		if ( ! shouldRender ) {
			return null;
		}

		// Asynchronously load and render component with passed props.
		return (
			<AsyncLoad
				require="my-sites/customer-home/cards/tasks/checklist-site-setup/wpcom-checklist/component.jsx"
				{ ...ownProps }
			/>
		);
	}
}

function shouldChecklistRender( viewMode, isEligibleForChecklist, taskList ) {
	// Render nothing if not eligible for checklist. Exception: checklist mode.
	if ( ! isEligibleForChecklist && viewMode !== 'checklist' ) {
		return false;
	}

	// Render nothing if all tasks are completed. Exception: checklist mode.
	if ( ! taskList.getFirstIncompleteTask && viewMode !== 'checklist' ) {
		return false;
	}

	return true;
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const designType = getSiteOption( state, siteId, 'design_type' );
	const isEligibleForChecklist = isEligibleForDotcomChecklist( state, siteId );
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
		shouldRender: shouldChecklistRender( viewMode, isEligibleForChecklist, taskList, siteId ),
	};
} )( WpcomChecklist );
