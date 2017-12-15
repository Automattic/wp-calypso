/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Checklist from 'components/checklist';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteChecklist } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { onboardingTasks, urlForTask } from 'my-sites/checklist/onboardingChecklist';
import { recordTracksEvent } from 'state/analytics/actions';

export class ChecklistThankYou extends PureComponent {
	static propTypes = {
		tasks: PropTypes.array,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		receiptId: PropTypes.number,
	};

	handleAction = taskId => {
		const { siteSlug, tasks, track } = this.props;
		const url = urlForTask( taskId, siteSlug );
		if ( url && tasks.length ) {
			const status = tasks[ taskId ] ? 'complete' : 'incomplete';
			track( 'calypso_checklist_task_start', {
				checklist_name: 'thank_you',
				step_name: taskId,
				status,
			} );

			page( url );
		}
	};

	handleToggle = taskId => {
		const { siteId, tasks, update } = this.props;

		if ( tasks && ! tasks[ taskId ] ) {
			update( siteId, taskId );
		}
	};

	render() {
		const { siteId, tasks } = this.props;
		const title = this.props.receiptId
			? 'Thank you for your purchase!'
			: 'Your site has been created!';

		return (
			<Main className={ classnames( 'checklist-thank-you', this.props.className ) }>
				<DocumentHead title="Thank you" />
				<div className="checklist-thank-you__container">
					<div className="checklist-thank-you__header">
						<img
							src="/calypso/images/signup/confetti.svg"
							className="checklist-thank-you__confetti"
						/>
						<FormattedHeader
							headerText={ title }
							subHeaderText={
								"Now that your site has been created, it's time to get it ready for you to share. " +
								"We've prepared a list of things that will help you get there quickly."
							}
						/>
					</div>
					{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
					<Checklist
						isLoading={ ! tasks.length }
						tasks={ tasks }
						onAction={ this.handleAction }
						onToggle={ this.handleToggle }
					/>
				</div>
			</Main>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const siteChecklist = getSiteChecklist( state, siteId );
	const tasks = siteChecklist ? onboardingTasks( siteChecklist.tasks ) : [];

	return { siteId, siteSlug, tasks };
};
const mapDispatchToProps = {
	track: recordTracksEvent,
	update: requestSiteChecklistTaskUpdate,
};

export default connect( mapStateToProps, mapDispatchToProps )( ChecklistThankYou );
