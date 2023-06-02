/**
 * Retrieve the WPCOM follower role info, based on site settings
 *
 * @param  {boolean} isPrivateSite    Whether site is private or not
 * @param  {Function} translate   `translate` function derived from `i18n-calypso`
 * @returns {Object}         Follower role object
 */
const getWpcomFollowerRole = ( isPrivateSite, translate ) => {
	const displayName = isPrivateSite
		? translate( 'Viewer', { context: 'Role that is displayed in a select' } )
		: translate( 'Follower', { context: 'Role that is displayed in a select' } );

	return {
		display_name: displayName,
		name: 'follower',
	};
};

export default getWpcomFollowerRole;
