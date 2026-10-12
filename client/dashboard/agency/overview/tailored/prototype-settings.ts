/**
 * PROTOTYPE — proof of concept only.
 *
 * Control panel settings for the Overview prototype: which experience to show
 * and optional overrides for the account's real approval status and tier.
 */
import config from '@automattic/calypso-config';
import { CALL_SCENARIOS, DEFAULT_CALL_SCENARIO } from './partner-calls';
import { DEFAULT_PARTNER_MANAGER_ID, PARTNER_MANAGERS } from './partner-managers';
import { createStoredValueHook, readStoredObject, writeStoredValue } from './prototype-store';
import type { CallScenario } from './partner-calls';
import type { AgencyApprovalStatus, AgencyTierId } from '@automattic/api-core';

const STORAGE_KEY = 'a4a-prototype-overview';

/**
 * - new: brand-new agency, nothing set up yet.
 * - getting-started: partly invested (some IAR, a referral or two, an advisor call booked).
 * - established: partner manager relationship.
 */
export type PrototypeExperience = 'new' | 'getting-started' | 'established';

/** `real` keeps the value from the logged-in agency. */
export type ApprovalStatusOverride = 'real' | AgencyApprovalStatus;
export type TierOverride = 'real' | AgencyTierId;

export interface PrototypeSettings {
	/** Unset until chosen; the Overview then picks “new” when signup answers exist. */
	experience?: PrototypeExperience;
	approvalStatus: ApprovalStatusOverride;
	tierId: TierOverride;
	/** Sample partner manager shown to established agencies at Pro tier and above. */
	partnerManagerId: string;
	/** Which dummy call history the partner manager area shows. */
	callScenario: CallScenario;
	/** Next-step to-dos the agency has checked off. */
	completedTodoIds: string[];
	/** Agenda the agency adds ahead of the next check-in. */
	discussionNotes: string;
	/** Overrides the account's influenced revenue (IAR); null keeps the real value. */
	influencedRevenue: number | null;
	isPanelOpen: boolean;
}

const DEFAULT_SETTINGS: PrototypeSettings = {
	approvalStatus: 'real',
	tierId: 'real',
	partnerManagerId: DEFAULT_PARTNER_MANAGER_ID,
	callScenario: DEFAULT_CALL_SCENARIO,
	completedTodoIds: [],
	discussionNotes: '',
	influencedRevenue: null,
	isPanelOpen: true,
};

const EXPERIENCES: PrototypeExperience[] = [ 'new', 'getting-started', 'established' ];
const APPROVAL_STATUSES: ApprovalStatusOverride[] = [ 'real', 'pending', 'approved', 'rejected' ];
export const TIER_OVERRIDES: TierOverride[] = [
	'real',
	'emerging-partner',
	'agency-partner',
	'pro-agency-partner',
	'vip-pro-agency-partner',
	'premier-partner',
];

const pick = < T >( value: unknown, allowed: T[], fallback: T ): T =>
	allowed.includes( value as T ) ? ( value as T ) : fallback;

function parseSettings( raw: string | null ): PrototypeSettings {
	let parsed: Record< string, unknown > = {};
	try {
		parsed = raw ? ( JSON.parse( raw ) ?? {} ) : {};
	} catch {
		// Fall back to the defaults below.
	}
	return {
		experience: pick< PrototypeExperience | undefined >(
			parsed.experience,
			EXPERIENCES,
			undefined
		),
		approvalStatus: pick(
			parsed.approvalStatus,
			APPROVAL_STATUSES,
			DEFAULT_SETTINGS.approvalStatus
		),
		tierId: pick( parsed.tierId, TIER_OVERRIDES, DEFAULT_SETTINGS.tierId ),
		partnerManagerId: pick(
			parsed.partnerManagerId,
			PARTNER_MANAGERS.map( ( manager ) => manager.id ),
			DEFAULT_SETTINGS.partnerManagerId
		),
		callScenario: pick( parsed.callScenario, CALL_SCENARIOS, DEFAULT_SETTINGS.callScenario ),
		completedTodoIds: Array.isArray( parsed.completedTodoIds )
			? parsed.completedTodoIds
					.filter( ( id ): id is string => typeof id === 'string' )
					.slice( 0, 50 )
			: [],
		discussionNotes:
			typeof parsed.discussionNotes === 'string' ? parsed.discussionNotes.slice( 0, 1000 ) : '',
		influencedRevenue:
			typeof parsed.influencedRevenue === 'number' &&
			Number.isFinite( parsed.influencedRevenue ) &&
			parsed.influencedRevenue >= 0
				? Math.min( parsed.influencedRevenue, 10_000_000 )
				: null,
		isPanelOpen:
			typeof parsed.isPanelOpen === 'boolean' ? parsed.isPanelOpen : DEFAULT_SETTINGS.isPanelOpen,
	};
}

export function updatePrototypeSettings( changes: Partial< PrototypeSettings > ) {
	writeStoredValue( STORAGE_KEY, { ...readStoredObject( STORAGE_KEY ), ...changes } );
}

export function resetPrototypeSettings() {
	writeStoredValue( STORAGE_KEY, null );
}

/** One-click demo setups that set every related control at once. */
export type QuickScenarioId = 'new-emerging' | 'getting-started' | 'established-pro';

export const QUICK_SCENARIOS: Record< QuickScenarioId, Partial< PrototypeSettings > > = {
	// Brand-new agency at Account activated: growth plan with the advisor call.
	'new-emerging': {
		experience: 'new',
		approvalStatus: 'approved',
		tierId: 'emerging-partner',
		influencedRevenue: 0,
		completedTodoIds: [],
		discussionNotes: '',
	},
	// Still at Account activated, but earning a little: a small Pressable plan, a couple of
	// referrals, no WooPayments yet, and an advisor call booked to set it up.
	'getting-started': {
		experience: 'getting-started',
		approvalStatus: 'approved',
		tierId: 'emerging-partner',
		influencedRevenue: 780,
		completedTodoIds: [],
		discussionNotes: '',
	},
	// Established Pro Partner with a partner manager and a booked check-in.
	'established-pro': {
		experience: 'established',
		approvalStatus: 'approved',
		tierId: 'pro-agency-partner',
		influencedRevenue: 9240,
		partnerManagerId: 'shane-tabrizi',
		callScenario: 'scheduled',
		completedTodoIds: [],
		discussionNotes: '',
	},
};

export function applyQuickScenario( id: QuickScenarioId ) {
	updatePrototypeSettings( QUICK_SCENARIOS[ id ] );
}

export const usePrototypeSettings = createStoredValueHook( STORAGE_KEY, parseSettings );

export const isOverviewPrototypeEnabled = () => config.isEnabled( 'a4a-tailored-experience' );
