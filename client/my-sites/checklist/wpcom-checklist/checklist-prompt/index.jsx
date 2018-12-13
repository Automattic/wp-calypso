/** @format */
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

/**
 * Stylesheet dependencies
 */

import './style.scss';

export class ChecklistPrompt extends Component {
	static propTypes = {
		isEligibleForDotcomChecklist: PropTypes.bool,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate, taskList } = this.props;

		const childrenArray = Children.toArray( this.props.children );

		const firstIncomplete = taskList.getFirstIncompleteTask();
		const isFinished = ! firstIncomplete;

		return (
			<div className="checklist-prompt">
				{ isFinished ? (
					<>
						<ChecklistPromptTask
							description={ translate(
								'We did it! You have completed {{a}}all the tasks{{/a}} on our checklist.',
								{
									components: {
										a: <a href={ `/checklist/${ this.props.siteSlug }` } />,
									},
								}
							) }
							title={ translate( 'Your site is ready to share' ) }
						/>
					</>
				) : (
					childrenArray.find( child => child.props.id === firstIncomplete.id )
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
	};
};

export default connect( mapStateToProps )( localize( ChecklistPrompt ) );
