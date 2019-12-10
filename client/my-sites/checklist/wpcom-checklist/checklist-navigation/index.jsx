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
import { Button, ProgressBar } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import isSiteChecklistLoading from 'state/selectors/is-site-checklist-loading';

/**
 * Style dependencies
 */
import './style.scss';

export class ChecklistNavigation extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		setStoredTask: PropTypes.func.isRequired,
		setNotification: PropTypes.func.isRequired,
		showNotification: PropTypes.bool,
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
		const { isLoading, siteSlug, translate, showNotification, taskList } = this.props;
		const { total, completed } = taskList.getCompletionStatus();

		if ( total === completed || isLoading ) {
			return null;
		}

		const buttonClasses = classNames( 'checklist-navigation__count', {
			'has-notification': showNotification,
		} );

		const checklistLink = '/checklist/' + siteSlug;

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

					<span className={ buttonClasses }>
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
			isLoading: isSiteChecklistLoading( state, siteId ),
		};
	},
	{ recordTracksEvent }
)( localize( ChecklistNavigation ) );
