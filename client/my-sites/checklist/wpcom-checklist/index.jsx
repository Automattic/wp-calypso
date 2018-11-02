/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getTaskList } from './wpcom-task-list';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import AsyncLoad from 'components/async-load';
import { getNeverShowBannerStatus } from 'my-sites/checklist/wpcom-checklist/checklist-banner/never-show';

class WpcomChecklist extends Component {
	render() {
		const {
			designType,
			isEligibleForDotcomChecklist: isEligibleForChecklist,
			siteId,
			taskStatuses,
			...ownProps
		} = this.props;

		const taskList = getTaskList( taskStatuses, designType );
		const isFullView = ! ownProps.viewMode || ownProps.viewMode === '';

		if ( ! isEligibleForChecklist && ! isFullView ) {
			return null;
		}

		if ( ! taskList.getFirstIncompleteTask && ! isFullView ) {
			return null;
		}

		if ( getNeverShowBannerStatus( siteId ) && ownProps.viewMode === 'banner' ) {
			return null;
		}

		return <AsyncLoad require="./component.jsx" { ...ownProps } />;
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		designType: getSiteOption( state, siteId, 'design_type' ),
		isEligibleForDotcomChecklist: isEligibleForDotcomChecklist( state, siteId ),
		siteId,
		taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
	};
} )( WpcomChecklist );
