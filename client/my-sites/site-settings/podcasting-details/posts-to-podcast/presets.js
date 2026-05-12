export function getVoicePresets( translate ) {
	return [
		{ id: 'witty', label: translate( 'Witty' ) },
		{ id: 'earnest', label: translate( 'Earnest' ) },
		{ id: 'professional', label: translate( 'Professional' ) },
	];
}

export function getLengthPresets( translate ) {
	return [
		{ id: 'short', label: translate( 'Short (~3 min)' ) },
		{ id: 'medium', label: translate( 'Medium (~7 min)' ) },
		{ id: 'long', label: translate( 'Long (~12 min)' ) },
	];
}

export function getWindowPresets( translate ) {
	return [
		{ id: 'last-7-days', label: translate( 'Last 7 days' ), unit: 'days', n: 7 },
		{ id: 'last-14-days', label: translate( 'Last 14 days' ), unit: 'days', n: 14 },
		{ id: 'last-30-days', label: translate( 'Last 30 days' ), unit: 'days', n: 30 },
		{ id: 'last-3-months', label: translate( 'Last 3 months' ), unit: 'months', n: 3 },
	];
}
