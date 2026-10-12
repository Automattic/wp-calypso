/**
 * PROTOTYPE — proof of concept only.
 *
 * Sample partner managers for the established-agency experience. Real
 * assignments will come from the agency record later. Partner managers work
 * with agencies of different sizes and value; that mapping isn't modeled yet.
 *
 * Headshots are cropped from the internal team page for the demo. Don't ship
 * them publicly without each partner manager's OK.
 */
import andrewMerinoPhoto from './partner-manager-photos/andrew-merino.jpg';
import badenFowlerPhoto from './partner-manager-photos/baden-fowler.jpg';
import kyleRunnerPhoto from './partner-manager-photos/kyle-runner.jpg';
import rossSpadaroPhoto from './partner-manager-photos/ross-spadaro.jpg';
import shaneTabriziPhoto from './partner-manager-photos/shane-tabrizi.jpg';
import sharonLeePhoto from './partner-manager-photos/sharon-lee.jpg';

export interface PartnerManager {
	id: string;
	name: string;
	/** Optional headshot. Without one, the card shows the manager's initials. */
	photoUrl?: string;
}

export const PARTNER_MANAGERS: PartnerManager[] = [
	{ id: 'kyle-runner', name: 'Kyle Runner', photoUrl: kyleRunnerPhoto },
	{ id: 'baden-fowler', name: 'Baden Fowler', photoUrl: badenFowlerPhoto },
	{ id: 'shane-tabrizi', name: 'Shane Tabrizi', photoUrl: shaneTabriziPhoto },
	{ id: 'andrew-merino', name: 'Andrew Merino', photoUrl: andrewMerinoPhoto },
	{ id: 'ross-spadaro', name: 'Ross Spadaro', photoUrl: rossSpadaroPhoto },
	{ id: 'sharon-lee', name: 'Sharon Lee', photoUrl: sharonLeePhoto },
];

// Shane is the established agency's partner manager; Sharon runs the getting-started advisor call.
export const DEFAULT_PARTNER_MANAGER_ID = 'shane-tabrizi';
export const GETTING_STARTED_ADVISOR_ID = 'sharon-lee';

export const getPartnerManager = ( id?: string ): PartnerManager =>
	PARTNER_MANAGERS.find( ( manager ) => manager.id === id ) ?? PARTNER_MANAGERS[ 0 ];

export const getInitials = ( name: string ) =>
	name
		.split( ' ' )
		.filter( Boolean )
		.slice( 0, 2 )
		.map( ( part ) => part[ 0 ].toUpperCase() )
		.join( '' );
