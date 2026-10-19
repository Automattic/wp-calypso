import { isEnabled } from '@automattic/calypso-config';

export const isAutomatticTeamMember = ( teams ) =>
	!! teams?.find( ( team ) => team.slug === 'a8c' );

// Saved posts is for Automatticians while it's dogfooded. The public launch
// drops the team check (READ-807).
export const isSavedPostsEnabled = ( teams ) =>
	isEnabled( 'reader/saved-posts' ) && isAutomatticTeamMember( teams );
