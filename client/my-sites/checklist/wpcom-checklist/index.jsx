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

class WpcomChecklist extends Component {
	static propTypes = {
		designType: PropTypes.oneOf( [ 'blog', 'page', 'portfolio' ] ),
		siteId: PropTypes.number,
		taskStatuses: PropTypes.object,
		viewMode: PropTypes.oneOf( [ 'checklist', 'banner', 'navigation', 'notification' ] ),
	};

	static defaultProps = {
		viewMode: 'checklist',
	};

	componentDidMount() {
		this.shouldShowNotification();
	}

	componentDidUpdate() {
		this.shouldShowNotification();
	}

	shouldShowNotification = () => {
		const {
			storedTask,
			isEligibleForDotcomChecklist: isEligibleForChecklist,
			isSiteSection: isSection,
			taskList,
		} = this.props;
		const firstIncomplete = taskList && taskList.getFirstIncompleteTask();

		if (
			firstIncomplete &&
			( storedTask !== firstIncomplete.id || storedTask === null ) &&
			isEligibleForChecklist &&
			isSection
		) {
			this.setNotification( true );
		} else {
			this.setNotification( false );
		}
	};

	setNotification = value => {
		if ( this.props.setNotification && this.props.viewMode === 'notification' ) {
			this.props.setNotification( value );
		}
	};

	render() {
		const {
			designType,
			isEligibleForDotcomChecklist: isEligibleForChecklist,
			isSiteSection: isSection,
			siteId,
			taskStatuses,
			...ownProps
		} = this.props;

		const { viewMode } = ownProps;

		const taskList = getTaskList( taskStatuses, designType );

		// Render nothing in notification mode.
		if ( viewMode === 'notification' ) {
			return null;
		}

		// Render nothing if not eligible for checklist. Exception: checklist mode.
		if ( ! isEligibleForChecklist && viewMode !== 'checklist' ) {
			return null;
		}

		// Render nothing if all tasks are completed. Exception: checklist mode.
		if ( ! taskList.getFirstIncompleteTask && viewMode !== 'checklist' ) {
			return null;
		}

		// Render nothing in navigation mode if the current section is not site-specific.
		if ( ! isSection && viewMode === 'navigation' ) {
			return null;
		}

		// Render nothing in banner mode if "never show banner" is set.
		if ( getNeverShowBannerStatus( siteId ) && viewMode === 'banner' ) {
			return null;
		}

		// Asynchronously load and render component with passed props.
		return <AsyncLoad require="./component.jsx" { ...ownProps } />;
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		designType: getSiteOption( state, siteId, 'design_type' ),
		isEligibleForDotcomChecklist: isEligibleForDotcomChecklist( state, siteId ),
		isSiteSection: isSiteSection( state ),
		siteId,
		taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
	};
} )( WpcomChecklist );
