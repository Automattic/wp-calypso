/**
 * PROTOTYPE — proof of concept only.
 *
 * Answers collected by `/custom-signup`. Nothing is sent to the API or HubSpot.
 * A non-personal subset is kept in localStorage so the overview page can read
 * it back and personalize itself for the demo.
 */

export type PrototypeSignupData = {
	firstName: string;
	lastName: string;
	email: string;
	agencyName: string;
	agencyUrl: string;
	phoneNumber: string;
	phoneCountryCode: string;
	country: string;
	userType: string;
	agencySize: string;
	managedSites: string;
	servicesOffered: string[];
	// Step 3 (goals): what the agency needs help with, in priority order (first = top).
	challenges: string[];
	challengesOther: string;
};

export const EMPTY_PROTOTYPE_SIGNUP_DATA: PrototypeSignupData = {
	firstName: '',
	lastName: '',
	email: '',
	agencyName: '',
	agencyUrl: '',
	phoneNumber: '',
	phoneCountryCode: 'US',
	country: '',
	userType: 'agency_owner',
	agencySize: '1-5',
	managedSites: '1-5',
	servicesOffered: [],
	challenges: [],
	challengesOther: '',
};

// Fake agency used to pre-fill step 1 so demos can click straight through.
// The goals step starts empty because those answers drive the personalized overview.
export const SAMPLE_PROTOTYPE_SIGNUP_DATA: PrototypeSignupData = {
	...EMPTY_PROTOTYPE_SIGNUP_DATA,
	firstName: 'Jamie',
	lastName: 'Rivera',
	email: 'jamie@northwindstudio.com',
	agencyName: 'Northwind Studio',
	agencyUrl: 'northwindstudio.com',
	phoneNumber: '5555550123',
	phoneCountryCode: 'US',
	country: 'US',
	userType: 'agency_owner',
	agencySize: '6-10',
	managedSites: '101-500',
	servicesOffered: [
		'website_design_development',
		'ecommerce_development',
		'maintenance_support_plans',
	],
};

const STORAGE_KEY = 'a4a-prototype-signup';

// Only the answers the overview needs are persisted. Contact details (email,
// phone, last name) stay in memory, so nothing personal lingers in the browser
// if someone types real info during a demo.
export type StoredPrototypeSignupData = Pick<
	PrototypeSignupData,
	| 'firstName'
	| 'agencyName'
	| 'agencyUrl'
	| 'country'
	| 'userType'
	| 'agencySize'
	| 'managedSites'
	| 'servicesOffered'
	| 'challenges'
	| 'challengesOther'
>;

const MAX_TEXT_LENGTH = 500;

const asString = ( value: unknown, fallback = '' ) =>
	typeof value === 'string' ? value.slice( 0, MAX_TEXT_LENGTH ) : fallback;

const asStringArray = ( value: unknown ) =>
	Array.isArray( value )
		? value.filter( ( item ): item is string => typeof item === 'string' ).slice( 0, 20 )
		: [];

export function savePrototypeSignupData( data: PrototypeSignupData ) {
	const stored: StoredPrototypeSignupData = {
		firstName: data.firstName,
		agencyName: data.agencyName,
		agencyUrl: data.agencyUrl,
		country: data.country,
		userType: data.userType,
		agencySize: data.agencySize,
		managedSites: data.managedSites,
		servicesOffered: data.servicesOffered,
		challenges: data.challenges,
		challengesOther: data.challengesOther,
	};

	try {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( stored ) );
	} catch {
		// Storage can be unavailable (private mode, blocked site data); the demo still works.
	}
}

// Storage is user-editable, so every field is type-checked and length-capped
// before the overview renders it.
export function loadPrototypeSignupData(): StoredPrototypeSignupData | null {
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return null;
		}
		const parsed: Record< string, unknown > = JSON.parse( raw ) ?? {};
		return {
			firstName: asString( parsed.firstName ),
			agencyName: asString( parsed.agencyName ),
			agencyUrl: asString( parsed.agencyUrl ),
			country: asString( parsed.country ),
			userType: asString( parsed.userType, EMPTY_PROTOTYPE_SIGNUP_DATA.userType ),
			agencySize: asString( parsed.agencySize, EMPTY_PROTOTYPE_SIGNUP_DATA.agencySize ),
			managedSites: asString( parsed.managedSites, EMPTY_PROTOTYPE_SIGNUP_DATA.managedSites ),
			servicesOffered: asStringArray( parsed.servicesOffered ),
			challenges: asStringArray( parsed.challenges ),
			challengesOther: asString( parsed.challengesOther ),
		};
	} catch {
		return null;
	}
}

// Overview prototype settings, owned by
// client/dashboard/agency/overview/tailored/prototype-settings.ts.
const OVERVIEW_SETTINGS_KEY = 'a4a-prototype-overview';

/**
 * A finished signup is a brand-new agency, so the Overview opens in the new
 * agency experience (the "new-emerging" quick scenario) until it's changed
 * from the control panel. Other control panel settings are kept.
 */
export function resetOverviewToNewAgency() {
	try {
		const raw = window.localStorage.getItem( OVERVIEW_SETTINGS_KEY );
		const parsed: unknown = raw ? JSON.parse( raw ) : null;
		const current = parsed && typeof parsed === 'object' ? parsed : {};
		window.localStorage.setItem(
			OVERVIEW_SETTINGS_KEY,
			JSON.stringify( {
				...current,
				experience: 'new',
				approvalStatus: 'approved',
				tierId: 'emerging-partner',
				influencedRevenue: 0,
				hasStartedPlan: false,
				completedTodoIds: [],
				discussionNotes: '',
			} )
		);
	} catch {
		// Storage can be unavailable; the Overview falls back to its defaults.
	}
}
