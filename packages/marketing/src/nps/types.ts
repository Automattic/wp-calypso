// TBD
// Currently the following data structures simply adhere the response of the current endpoint.
// However, it likely can be simplified.
export interface NpsEligibility {
	displaySurvey: boolean;
	secondsUntilEligible: number;
	hasAvailableConciergeSessions: boolean;
}

export interface NpsEligibilityApiResponse {
	display_survey: boolean;
	seconds_until_eligible: number;
	has_available_concierge_sessions: boolean;
}
