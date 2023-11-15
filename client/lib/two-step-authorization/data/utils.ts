import { bumpStat } from 'calypso/lib/analytics/mc';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export function bumpTwoStepAuthMCStat( eventAction: string ) {
	bumpStat( '2fa', eventAction );
	recordTracksEvent( 'calypso_login_twostep_authorize', {
		event_action: eventAction,
	} );
}
