/**
 * PROTOTYPE — proof of concept only.
 *
 * Reads the answers `/custom-signup` saves to localStorage so the Overview can
 * tailor itself for a new agency. The dashboard can't import from
 * a8c-for-agencies, so this mirrors the reader in
 * client/a8c-for-agencies/sections/signup/custom-signup/lib/prototype-signup-data.ts;
 * keep the storage key and field names in sync with it.
 */
import { createStoredValueHook, readStoredObject, writeStoredValue } from './prototype-store';

const STORAGE_KEY = 'a4a-prototype-signup';
const MAX_TEXT_LENGTH = 500;

export type SignupGoal =
	'more_leads' | 'passive_income' | 'better_hosting' | 'optimize_operations' | 'other';

export const SIGNUP_GOALS: SignupGoal[] = [
	'more_leads',
	'passive_income',
	'better_hosting',
	'optimize_operations',
	'other',
];

export interface SignupProfile {
	firstName: string;
	agencyName: string;
	agencyUrl: string;
	agencySize: string;
	managedSites: string;
	servicesOffered: string[];
	/** In priority order, top priority first. */
	goals: SignupGoal[];
	otherGoal: string;
}

export const SAMPLE_SIGNUP_PROFILE: SignupProfile = {
	firstName: 'Jamie',
	agencyName: 'Northwind Studio',
	agencyUrl: 'northwindstudio.com',
	agencySize: '6-10',
	managedSites: '101-500',
	servicesOffered: [
		'website_design_development',
		'ecommerce_development',
		'maintenance_support_plans',
	],
	goals: [ 'more_leads', 'better_hosting', 'passive_income' ],
	otherGoal: '',
};

const asString = ( value: unknown ) =>
	typeof value === 'string' ? value.slice( 0, MAX_TEXT_LENGTH ) : '';

const asStringArray = ( value: unknown ) =>
	Array.isArray( value )
		? value.filter( ( item ): item is string => typeof item === 'string' ).slice( 0, 20 )
		: [];

const isSignupGoal = ( value: string ): value is SignupGoal =>
	SIGNUP_GOALS.includes( value as SignupGoal );

// Storage is user-editable, so every field is type-checked and length-capped.
function parseSignupProfile( raw: string | null ): SignupProfile | null {
	if ( ! raw ) {
		return null;
	}
	try {
		const parsed: Record< string, unknown > = JSON.parse( raw ) ?? {};
		return {
			firstName: asString( parsed.firstName ),
			agencyName: asString( parsed.agencyName ),
			agencyUrl: asString( parsed.agencyUrl ),
			agencySize: asString( parsed.agencySize ),
			managedSites: asString( parsed.managedSites ),
			servicesOffered: asStringArray( parsed.servicesOffered ),
			goals: asStringArray( parsed.challenges ).filter( isSignupGoal ),
			otherGoal: asString( parsed.challengesOther ),
		};
	} catch {
		return null;
	}
}

/** Saves in the signup's own field names, keeping any fields the Overview doesn't use. */
export function saveSignupProfile( profile: SignupProfile ) {
	writeStoredValue( STORAGE_KEY, {
		...readStoredObject( STORAGE_KEY ),
		firstName: profile.firstName,
		agencyName: profile.agencyName,
		agencyUrl: profile.agencyUrl,
		agencySize: profile.agencySize,
		managedSites: profile.managedSites,
		servicesOffered: profile.servicesOffered,
		challenges: profile.goals,
		challengesOther: profile.otherGoal,
	} );
}

export function clearSignupProfile() {
	writeStoredValue( STORAGE_KEY, null );
}

/** The saved signup answers, or null when nothing was saved. */
export const useSignupProfile = createStoredValueHook( STORAGE_KEY, parseSignupProfile );
