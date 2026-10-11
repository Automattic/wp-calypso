/**
 * PROTOTYPE — proof of concept only.
 *
 * Dummy partner manager call data for the established-agency experience. Real
 * data will come from the partner manager's logged calls; nothing here is
 * connected to HubSpot. Dates are relative to today so every scenario stays
 * believable whenever the prototype is demoed.
 */
import { __ } from '@wordpress/i18n';
import type { SignupGoal } from './signup-profile';

// Established agencies have always had their first call with their partner manager.
export type CallScenario = 'scheduled' | 'not-scheduled' | 'overdue';

export const CALL_SCENARIOS: CallScenario[] = [ 'scheduled', 'not-scheduled', 'overdue' ];

export const DEFAULT_CALL_SCENARIO: CallScenario = 'scheduled';

/** Placeholder meeting link for the demo. */
export const SAMPLE_JOIN_URL = 'https://meet.google.com/';

/** No check-in for this long highlights the section. */
export const CHECK_IN_OVERDUE_DAYS = 90;

export const getCallScenarioLabels = (): Record< CallScenario, string > => ( {
	scheduled: __( 'Check-in scheduled' ),
	'not-scheduled': __( 'No check-in scheduled' ),
	overdue: __( 'Overdue (3+ months)' ),
} );

export interface CallTodo {
	id: string;
	title: string;
	owner: 'agency' | 'partner-manager';
	dueDate: Date;
	/** Partner-manager items they've already closed out. */
	isDoneByPartnerManager?: boolean;
}

export interface CallRecap {
	date: Date;
	summary: string;
	todos: CallTodo[];
}

export interface PartnerCalls {
	nextCall: Date | null;
	/** Video call link for the next check-in. */
	joinUrl?: string;
	lastCall: CallRecap | null;
	isOverdue: boolean;
}

const DAY = 24 * 60 * 60 * 1000;

function daysFromNow( days: number, hour = 11 ) {
	const date = new Date( Date.now() + days * DAY );
	date.setHours( hour, 0, 0, 0 );
	return date;
}

// Agency-owned next steps, chosen to match their top goals.
const getAgencyTodos = (): Record< SignupGoal, Omit< CallTodo, 'dueDate' > > => ( {
	more_leads: {
		id: 'directory-profile',
		title: __( 'Finish your Partner Directory profile with two recent case studies' ),
		owner: 'agency',
	},
	passive_income: {
		id: 'first-referrals',
		title: __( 'Send referral carts to two retainer clients due for renewal' ),
		owner: 'agency',
	},
	better_hosting: {
		id: 'migration-list',
		title: __( 'Share the list of client sites you want to migrate' ),
		owner: 'agency',
	},
	optimize_operations: {
		id: 'connect-mcp',
		title: __( 'Connect your AI assistant to the agency MCP' ),
		owner: 'agency',
	},
	other: {
		id: 'share-priorities',
		title: __( 'Share your top three priorities for next quarter' ),
		owner: 'agency',
	},
} );

const PARTNER_MANAGER_TODOS: Omit< CallTodo, 'dueDate' >[] = [
	{
		id: 'pm-migration-quote',
		title: __( 'Send a Pressable migration plan and quote' ),
		owner: 'partner-manager',
		isDoneByPartnerManager: true,
	},
	{
		id: 'pm-woo-intro',
		title: __( 'Introduce you to the WooCommerce partnerships team' ),
		owner: 'partner-manager',
	},
];

// Due dates are always ahead of today, so no next step shows as overdue in the demo.
function buildRecap( callDate: Date, goals: SignupGoal[] ): CallRecap {
	const agencyTodos = getAgencyTodos();
	const ranked = goals.length ? goals : ( [ 'other' ] as SignupGoal[] );
	const todos: CallTodo[] = [
		...ranked.slice( 0, 3 ).map( ( goal, index ) => ( {
			...agencyTodos[ goal ],
			dueDate: daysFromNow( 10 + index * 7 ),
		} ) ),
		...PARTNER_MANAGER_TODOS.map( ( todo, index ) => ( {
			...todo,
			dueDate: daysFromNow( 6 + index * 7 ),
		} ) ),
	];

	return {
		date: callDate,
		summary: __(
			'We reviewed your progress toward Pro Partner and agreed to focus on your top priorities this quarter. Next, we’ll line up migrations for your larger clients and look at where referrals can replace reselling.'
		),
		todos,
	};
}

export function getPartnerCalls( scenario: CallScenario, goals: SignupGoal[] ): PartnerCalls {
	switch ( scenario ) {
		case 'scheduled':
			return {
				nextCall: daysFromNow( 4, 14 ),
				joinUrl: SAMPLE_JOIN_URL,
				lastCall: buildRecap( daysFromNow( -21 ), goals ),
				isOverdue: false,
			};
		case 'not-scheduled':
			return {
				nextCall: null,
				lastCall: buildRecap( daysFromNow( -35 ), goals ),
				isOverdue: false,
			};
		case 'overdue':
		default:
			return {
				nextCall: null,
				lastCall: buildRecap( daysFromNow( -( CHECK_IN_OVERDUE_DAYS + 18 ) ), goals ),
				isOverdue: true,
			};
	}
}
