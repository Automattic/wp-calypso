// function that tells us if we want to show the Help Center to the user, given that we're showing it to
// only a certain percentage of users.
export function shouldShowHelpCenterToUser( userId: number, locale: string ) {
	const currentSegment = 10; //percentage of users that will see the Help Center, not the FAB
	const userSegment = userId % 100;
	return userSegment < currentSegment && locale === 'en';
}
