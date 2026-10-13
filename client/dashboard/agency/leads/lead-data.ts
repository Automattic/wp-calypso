/**
 * PROTOTYPE — proof of concept only.
 *
 * Client leads for the Leads dashboard and the Overview's Client leads card.
 * Leads come from two places: the partner directories (businesses that find the
 * agency's listing) and Automattic (qualified leads our sales teams pass on).
 * Sample data until leads are tracked in the backend; the agency's edits are
 * saved to localStorage so the demo remembers them.
 */
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import {
	createStoredValueHook,
	readStoredObject,
	writeStoredValue,
} from '../overview/tailored/prototype-store';

export type LeadStatus = 'new' | 'in-progress' | 'won' | 'lost';
/**
 * - directory: a client found the agency on a partner directory (Woo, Jetpack,
 *   WordPress.com, Pressable). Not qualified; directories work independently.
 * - qualified: Automattic passes the lead on, either from a Hire an Expert page
 *   (Woo, Jetpack, WordPress.com, Pressable) or internally from a sales team
 *   (including VIP, which has no Hire an Expert page and is enterprise-sized).
 */
export type LeadSource = 'directory' | 'qualified';
export type LostReason = 'another-agency' | 'budget' | 'timing' | 'not-a-fit' | 'other';

export interface Lead {
	id: string;
	client: string;
	contactName: string;
	project: string;
	source: LeadSource;
	/** Where it came from, e.g. "Pressable partner directory" or "WooCommerce Hire an Expert". */
	sourceDetail: string;
	/** The value estimated when the lead came in, in USD. */
	reportedValue: number;
	/** What the project actually came to, reported by the agency once won. */
	actualValue?: number;
	status: LeadStatus;
	/** When the lead came in. */
	receivedAt: string;
	/** Days from first contact to close, reported by the agency. */
	daysToClose?: number;
	lostReason?: LostReason;
	notes?: string;
}

/** The fields an agency can update from the edit modal. */
export type LeadEdits = Pick<
	Lead,
	'status' | 'actualValue' | 'daysToClose' | 'lostReason' | 'notes'
>;

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = ( days: number ) => new Date( Date.now() - days * DAY ).toISOString();

export const getLeadStatusLabels = (): Record< LeadStatus, string > => ( {
	new: __( 'New' ),
	'in-progress': __( 'In progress' ),
	won: __( 'Closed won' ),
	lost: __( 'Closed lost' ),
} );

export const getLeadSourceLabels = (): Record< LeadSource, string > => ( {
	directory: __( 'Partner Directory' ),
	qualified: __( 'Qualified lead' ),
} );

export const getLostReasonLabels = (): Record< LostReason, string > => ( {
	'another-agency': __( 'Chose another agency' ),
	budget: __( 'Budget' ),
	timing: __( 'Timing' ),
	'not-a-fit': __( 'Not a fit' ),
	other: __( 'Other' ),
} );

export const isOpenLead = ( lead: Lead ) => lead.status === 'new' || lead.status === 'in-progress';

/** A won lead's actual value when reported, otherwise its reported value. */
export const getLeadValue = ( lead: Lead ) =>
	lead.status === 'won' && lead.actualValue !== undefined ? lead.actualValue : lead.reportedValue;

const getSampleLeads = (): Lead[] => [
	// Listed in display order: the VIP deal first, closed lost last.
	{
		// VIP leads are enterprise-sized and always come from the VIP Sales Team.
		id: 'lead-meridian-health',
		client: 'Meridian Health Network',
		contactName: 'Alex Romero',
		project: __( 'Publishing platform on WordPress VIP' ),
		source: 'qualified',
		sourceDetail: __( 'VIP Sales Team' ),
		reportedValue: 250000,
		status: 'in-progress',
		receivedAt: daysAgo( 21 ),
	},
	{
		id: 'lead-harbor-coffee',
		client: 'Harbor Coffee Co.',
		contactName: 'Maya Chen',
		project: __( 'WooCommerce store rebuild' ),
		source: 'qualified',
		sourceDetail: __( 'WooCommerce Hire an Expert' ),
		reportedValue: 18000,
		status: 'in-progress',
		receivedAt: daysAgo( 1 ),
	},
	{
		id: 'lead-northgate-clinic',
		client: 'Northgate Clinic',
		contactName: 'Dr. Priya Raman',
		project: __( 'Accessible site redesign' ),
		source: 'directory',
		sourceDetail: __( 'WordPress.com partner directory' ),
		reportedValue: 12500,
		status: 'in-progress',
		receivedAt: daysAgo( 3 ),
	},
	{
		id: 'lead-summit-legal',
		client: 'Summit Legal',
		contactName: 'Rachel Ortiz',
		project: __( 'Marketing site on WordPress.com' ),
		source: 'qualified',
		sourceDetail: __( 'WordPress.com Hire an Expert' ),
		reportedValue: 9500,
		actualValue: 11200,
		status: 'won',
		receivedAt: daysAgo( 52 ),
		daysToClose: 28,
	},
	{
		id: 'lead-pine-ridge',
		client: 'Pine Ridge Outfitters',
		contactName: 'Ben Larsen',
		project: __( 'Black Friday performance work' ),
		source: 'directory',
		sourceDetail: __( 'Jetpack partner directory' ),
		reportedValue: 7800,
		actualValue: 7800,
		status: 'won',
		receivedAt: daysAgo( 61 ),
		daysToClose: 20,
	},
	{
		id: 'lead-lakeview-dental',
		client: 'Lakeview Dental',
		contactName: 'Hannah Moore',
		project: __( 'Booking and patient forms' ),
		source: 'directory',
		sourceDetail: __( 'Pressable partner directory' ),
		reportedValue: 6000,
		status: 'lost',
		receivedAt: daysAgo( 38 ),
		daysToClose: 14,
		lostReason: 'budget',
	},
];

const STORAGE_KEY = 'a4a-prototype-leads';
const STATUSES: LeadStatus[] = [ 'new', 'in-progress', 'won', 'lost' ];
const LOST_REASONS = Object.keys( getLostReasonLabels() ) as LostReason[];
const MAX_VALUE = 10_000_000;

const asAmount = ( value: unknown ) =>
	typeof value === 'number' && Number.isFinite( value ) && value >= 0
		? Math.min( Math.round( value ), MAX_VALUE )
		: undefined;

// Storage is user-editable, so every saved field is checked before it's merged in.
function parseEdits( raw: string | null ): Record< string, Partial< LeadEdits > > {
	let parsed: Record< string, unknown > = {};
	try {
		parsed = raw ? ( JSON.parse( raw ) ?? {} ) : {};
	} catch {
		return {};
	}
	const edits: Record< string, Partial< LeadEdits > > = {};
	for ( const [ id, value ] of Object.entries( parsed ) ) {
		if ( ! value || typeof value !== 'object' ) {
			continue;
		}
		const item = value as Record< string, unknown >;
		edits[ id ] = {
			status: STATUSES.includes( item.status as LeadStatus )
				? ( item.status as LeadStatus )
				: undefined,
			actualValue: asAmount( item.actualValue ),
			daysToClose: asAmount( item.daysToClose ),
			lostReason: LOST_REASONS.includes( item.lostReason as LostReason )
				? ( item.lostReason as LostReason )
				: undefined,
			notes: typeof item.notes === 'string' ? item.notes.slice( 0, 1000 ) : undefined,
		};
	}
	return edits;
}

const useLeadEdits = createStoredValueHook( STORAGE_KEY, parseEdits );

const withoutUndefined = ( edits: Partial< LeadEdits > ) =>
	Object.fromEntries(
		Object.entries( edits ).filter( ( [ , value ] ) => value !== undefined )
	) as Partial< LeadEdits >;

/** The sample leads with the agency's saved edits applied. */
export function useLeads(): Lead[] {
	const edits = useLeadEdits();
	return useMemo(
		() =>
			getSampleLeads().map( ( lead ) => ( {
				...lead,
				...withoutUndefined( edits[ lead.id ] ?? {} ),
			} ) ),
		[ edits ]
	);
}

export function saveLeadEdits( id: string, edits: LeadEdits ) {
	writeStoredValue( STORAGE_KEY, { ...readStoredObject( STORAGE_KEY ), [ id ]: edits } );
}

export function resetLeadEdits() {
	writeStoredValue( STORAGE_KEY, null );
}
