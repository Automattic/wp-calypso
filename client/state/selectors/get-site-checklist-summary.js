/** @format */

/**
 * External dependencies
 */
import { get, groupBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import { onboardingTasks } from 'my-sites/checklist/onboardingChecklist';

/**
 * Returns the checklist for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object}        Site settings
 */
const getSiteChecklistSummary = createSelector(
	( state, siteId = false ) => {
		if ( siteId === false ) {
			siteId = getSelectedSiteId( state );
		}
		const checklist = getSiteChecklist( state, siteId );
		const tasks = onboardingTasks( checklist );

		const tasksByComplete = groupBy(
			map( tasks, ( task, taskName ) => ( { ...task, task: taskName } ) ),
			task => ( task.completed ? 'complete' : 'incomplete' )
		);

		const numComplete = get( tasksByComplete, 'complete.length', 0 );
		const numIncomplete = get( tasksByComplete, 'incomplete.length', 0 );
		const totalTasks = numComplete + numIncomplete;
		const percentageComplete = 100 * ( numComplete / totalTasks );

		return {
			designType: get( checklist, 'designType' ),
			numComplete,
			numIncomplete,
			percentageComplete,
			tasks: { ...tasksByComplete },
			totalTasks,
		};
	},
	state => [ getSiteChecklist( state ), getSelectedSiteId( state ) ]
);

export default getSiteChecklistSummary;
