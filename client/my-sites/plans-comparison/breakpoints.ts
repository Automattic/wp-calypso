import {
	SCREEN_BREAKPOINT_SIGNUP,
	SCREEN_BREAKPOINT_PLANS,
	SCREEN_MID_BREAKPOINT_SIGNUP,
	SCREEN_MID_BREAKPOINT_PLANS,
} from './constant';

export function mobile_breakpoint( content: string ) {
	return `
	@media screen and ( max-width: ${ SCREEN_BREAKPOINT_SIGNUP }px ) {
		.is-section-signup & {
			${ content }
		}
	}

	@media screen and ( max-width: ${ SCREEN_BREAKPOINT_PLANS }px ) {
		.is-section-plans & {
			${ content }
		}
	}`;
}

export function mid_breakpoint( content: string ) {
	return `
	@media screen and ( max-width: ${ SCREEN_MID_BREAKPOINT_SIGNUP }px ) {
		.is-section-signup & {
			${ content }
		}
	}

	@media screen and ( max-width: ${ SCREEN_MID_BREAKPOINT_PLANS }px ) {
		.is-section-plans & {
			${ content }
		}
	}`;
}
