/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ProgressBar from 'components/progress-bar';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

export class ChecklistNavigation extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		setStoredTask: PropTypes.func.isRequired,
		setNotification: PropTypes.func.isRequired,
		showNotification: PropTypes.bool,
		canShowChecklist: PropTypes.bool,
		closePopover: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
	};

	handleClick = () => {
		const task = this.props.taskList.getFirstIncompleteTask();

		if ( task ) {
			this.props.setStoredTask( task.id );
		}
		this.props.setNotification( false );
		this.props.closePopover();
		this.props.recordTracksEvent( 'calypso_inlinehelp_checklist_click' );
	};

	render() {
		const { siteSlug, translate, showNotification, canShowChecklist, taskList } = this.props;

		const buttonClasses = {
			'has-notification': showNotification,
			'checklist-navigation__count': true,
		};
		const { total, completed } = taskList.getCompletionStatus();
		const isFinished = ! taskList.getFirstIncompleteTask();
		const checklistLink = '/checklist/' + siteSlug;

		if ( ! canShowChecklist || isFinished ) {
			return null;
		}

		return (
			<div className="checklist-navigation">
				<Button
					onClick={ this.handleClick }
					href={ checklistLink }
					className="checklist-navigation__button"
					borderless
				>
					<span className="checklist-navigation__label">
						{ translate( 'Continue Site Setup' ) }
					</span>

					<span className={ classNames( buttonClasses ) }>
						{ translate( '%(complete)d/%(total)d', {
							comment: 'Numerical progress indicator, like 5/9',
							args: {
								complete: completed,
								total: total,
							},
						} ) }
					</span>

					<div className="checklist-navigation__progress-bar-margin">
						<ProgressBar total={ total } value={ completed } compact />
					</div>
				</Button>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	{ recordTracksEvent }
)( localize( ChecklistNavigation ) );
