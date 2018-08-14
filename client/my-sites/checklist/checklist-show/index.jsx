/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, reduce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Checklist from 'components/checklist';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import Task from 'blocks/checklist/task';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, getSiteSlug } from 'state/sites/selectors';
import { tasks as jetpackTasks } from '../jetpack-checklist';
import { tasks as wpcomTasks } from '../onboardingChecklist';

class ChecklistShow extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		useJetpackChecklist: PropTypes.bool,
	};

	render() {
		const { useJetpackChecklist, siteId, siteSlug, taskStatuses } = this.props;
		const tasks = useJetpackChecklist ? jetpackTasks : wpcomTasks;
		const completedCount = reduce(
			tasks,
			( count, { id, completed } ) =>
				completed || get( taskStatuses, [ id, 'completed' ] ) ? count + 1 : count,
			0
		);
		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<Checklist isPlaceholder={ ! taskStatuses } completedCount={ completedCount }>
					{ tasks.map( taskProps => (
						<Task { ...taskProps } key={ taskProps.id } siteId={ siteId } siteSlug={ siteSlug } />
					) ) }
				</Checklist>
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const useJetpackChecklist = isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId );
	const taskStatuses = get( getSiteChecklist( state, siteId ), [ 'tasks' ] );

	return {
		siteId,
		siteSlug,
		taskStatuses,
		useJetpackChecklist,
	};
};

export default connect( mapStateToProps )( localize( ChecklistShow ) );
