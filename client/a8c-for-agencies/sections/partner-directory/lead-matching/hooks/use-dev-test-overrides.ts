/**
 * DEV/TEST ONLY - URL parameter overrides for testing lead matching states
 *
 * This hook provides test data and state overrides via URL parameters.
 * It should be removed or disabled in production.
 *
 * Usage:
 * - ?state=eligible  → Shows "Eligible for leads" badge with all fields populated
 * - ?state=ready     → Shows "1 step left" badge with all fields populated
 * - ?completed=5     → Shows progress bar with 5 of 11 fields populated
 * - ?completed=0     → Shows empty progress state
 */

import { LeadMatchingDetails } from '../../types';

/**
 * Get default empty form data
 */
export const getDefaultFormData = (): LeadMatchingDetails => ( {
	// Regions & languages
	regions: [],
	supportsGlobal: false,
	languages: [],

	// Client types
	businessTypes: [],
	otherBusinessType: '',
	idealBusinessTypes: [],
	otherIdealBusinessType: '',
	companySizes: [],

	// Technical environment
	hostingEnvironments: [],
	supportsHostingRecommendation: false,
	migrationPlatforms: [],
	storeComplexities: [],

	// Project types
	projectTypes: [],
	supportsQuickHelp: false,
	serviceLevels: [],

	// Budget & timeline
	budgetLevels: [],
	minimumBudget: '',
	timingPreferences: [],
	supportsHardDeadlines: false,

	// Decision making
	decisionProcesses: [],

	// Ongoing support
	ongoingRelationships: [],
	requiresMaintenance: false,
} );

/**
 * DEV ONLY: Generate test form data with a specified number of completed fields
 */
const getTestFormData = ( completedCount: number ): LeadMatchingDetails => {
	const base = getDefaultFormData();

	// Required fields in order - fill based on completedCount
	const fieldsToFill: Array< keyof LeadMatchingDetails > = [
		'regions',
		'languages',
		'businessTypes',
		'idealBusinessTypes',
		'companySizes',
		'projectTypes',
		'serviceLevels',
		'budgetLevels',
		'timingPreferences',
		'decisionProcesses',
		'ongoingRelationships',
	];

	const testValues: Partial< LeadMatchingDetails > = {
		regions: [ 'americas' ],
		languages: [ 'English' ],
		businessTypes: [ 'local_service' ],
		idealBusinessTypes: [ 'local_service' ],
		companySizes: [ '1_5' ],
		projectTypes: [ 'new_wordpress' ],
		serviceLevels: [ 'essential' ],
		budgetLevels: [ 'affordable' ],
		timingPreferences: [ 'flexible' ],
		decisionProcesses: [ 'individual' ],
		ongoingRelationships: [ 'training' ],
	};

	for ( let i = 0; i < Math.min( completedCount, fieldsToFill.length ); i++ ) {
		const field = fieldsToFill[ i ];
		( base as unknown as Record< string, unknown > )[ field ] = testValues[ field ];
	}

	return base;
};

/**
 * DEV ONLY: Parse URL parameters for test overrides
 */
const getUrlTestParams = () => {
	const urlParams = new URLSearchParams( window.location.search );
	return {
		stateOverride: urlParams.get( 'state' ),
		completedOverride: urlParams.get( 'completed' ),
	};
};

/**
 * DEV ONLY: Check if any test overrides are active
 */
export const hasTestOverrides = (): boolean => {
	const { stateOverride, completedOverride } = getUrlTestParams();
	return !! stateOverride || !! completedOverride;
};

/**
 * DEV ONLY: Get form data with test overrides applied
 */
export const getFormDataWithTestOverrides = (
	initialFormData?: LeadMatchingDetails | null
): LeadMatchingDetails => {
	const { stateOverride, completedOverride } = getUrlTestParams();

	// For eligible/ready states, fill all fields
	if ( stateOverride === 'eligible' || stateOverride === 'ready' ) {
		return getTestFormData( 11 );
	}

	// For completed param, fill that many fields
	if ( completedOverride ) {
		const count = parseInt( completedOverride, 10 );
		if ( ! isNaN( count ) ) {
			return getTestFormData( count );
		}
	}

	return initialFormData ?? getDefaultFormData();
};

/**
 * DEV ONLY: Get eligibility state with test overrides
 */
export const getEligibilityStateOverride = (): 'eligible' | 'ready' | 'in-progress' | null => {
	const { stateOverride } = getUrlTestParams();
	if ( stateOverride && [ 'eligible', 'ready', 'in-progress' ].includes( stateOverride ) ) {
		return stateOverride as 'eligible' | 'ready' | 'in-progress';
	}
	return null;
};

/**
 * DEV ONLY: Get completion count override
 */
export const getCompletionOverride = ( total: number ): number | null => {
	const { completedOverride } = getUrlTestParams();
	if ( completedOverride ) {
		const overrideValue = Math.min( Math.max( 0, parseInt( completedOverride, 10 ) ), total );
		if ( ! isNaN( overrideValue ) ) {
			return overrideValue;
		}
	}
	return null;
};
