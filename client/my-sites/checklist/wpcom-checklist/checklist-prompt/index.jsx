/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Children, Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ChecklistPromptTask from './task';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getChecklistPromptTaskId } from 'state/inline-help/selectors';

/**
 * Stylesheet dependencies
 */

import './style.scss';

export class ChecklistPrompt extends Component {
	static propTypes = {
		children: PropTypes.array,
		isEligibleForDotcomChecklist: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		taskList: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate, taskList, children, promptTaskId } = this.props;
		const childrenArray = Children.toArray( children );
		const firstIncomplete = taskList.getFirstIncompleteTask();
		const isFinished = ! firstIncomplete;
		const promptTask = promptTaskId && taskList.get( promptTaskId );
		const theTaskId = promptTask ? promptTask.id : firstIncomplete.id;

		return (
			<div className="checklist-prompt">
				{ isFinished ? (
					<ChecklistPromptTask
						description={ translate(
							'You did it! You have completed all the tasks on your checklist.'
						) }
						title={ translate( 'Your site is ready to share' ) }
					/>
				) : (
					childrenArray.find( child => child.props.id === theTaskId )
				) }
			</div>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		promptTaskId: getChecklistPromptTaskId( state ),
	};
};

export default connect( mapStateToProps )( localize( ChecklistPrompt ) );
