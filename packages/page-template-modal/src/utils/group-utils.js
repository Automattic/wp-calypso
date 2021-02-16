/**
 * External dependencies
 */
import { intersection, difference } from 'lodash';

/**
 * Sorts the keys on the group object to have a preferred order.
 * If some groups exist without a preferred order, they will be included last
 *
 * @param {Array<string>} preferredGroupOrder the order of group slugs that we want
 * @param {object} groupsObject an object with all group information, with group names as keys
 */
export function sortGroupNames( preferredGroupOrder, groupsObject ) {
	const groups = Object.keys( groupsObject );

	const orderedGroups = intersection( preferredGroupOrder, groups );
	const remainingGroups = difference( groups, preferredGroupOrder );
	const allGroups = orderedGroups.concat( remainingGroups );

	return allGroups.reduce( ( result, groupName ) => {
		result[ groupName ] = groupsObject[ groupName ];
		return result;
	}, {} );
}
