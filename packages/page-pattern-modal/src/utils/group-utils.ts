/**
 * Sorts the keys on the group object to have a preferred order.
 * If some groups exist without a preferred order, they will be included last
 * @param preferredGroupOrder the order of group slugs that we want
 * @param groupsObject an object with all group information, with group names as keys
 */
export function sortGroupNames< T >(
	preferredGroupOrder: string[],
	groupsObject: Record< string, T >
): Record< string, T > {
	const groups = Object.keys( groupsObject );

	const orderedGroups = preferredGroupOrder.filter( ( x ) => groups.includes( x ) );
	const remainingGroups = groups.filter( ( x ) => ! preferredGroupOrder.includes( x ) );
	const allGroups = orderedGroups.concat( remainingGroups.sort() );

	return allGroups.reduce(
		( result, groupName ) => {
			result[ groupName ] = groupsObject[ groupName ];
			return result;
		},
		{} as Record< string, T >
	);
}
