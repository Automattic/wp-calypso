export const ONBOARDING_TOUR_HASH = '#onboarding-tour';

export function replaceHash( hash: string ) {
	window.history.replaceState(
		window.history.state,
		'',
		`${ window.location.pathname }${ window.location.search }${ hash }`
	);
}
