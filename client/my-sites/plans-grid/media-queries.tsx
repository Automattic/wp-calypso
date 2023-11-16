import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';

const sidebarWidth = 272; //in px
const plans2023SmallBreakpoint = '780px';
const plans2023MediumBreakpoint = '1200px';
const plans2023LargeBreakpoint = '1600px';
const plans2023SmallWithSidebarBreakpoint = `${ 780 + sidebarWidth }px`;
const plans2023MediumWithSidebarBreakpoint = `${ 1200 + sidebarWidth }px`;
const plans2023LargeWithSidebarBreakpoint = `${ 1600 + sidebarWidth }px`;

export const plansBreakSmall = ( styles: SerializedStyles ) => css`
	body.is-section-signup.is-white-signup &,
	body.is-section-stepper & {
		@media ( min-width: ${ plans2023SmallBreakpoint } ) {
			${ styles }
		}
	}

	.is-section-plans:not( .is-sidebar-collapsed ) & {
		@media ( min-width: ${ plans2023SmallWithSidebarBreakpoint } ) {
			${ styles }
		}
	}

	.is-section-plans.is-sidebar-collapsed & {
		@media ( min-width: ${ plans2023SmallBreakpoint } ) {
			${ styles }
		}
	}
`;

export const plansBreakMedium = ( styles: SerializedStyles ) => css`
	body.is-section-signup.is-white-signup &,
	body.is-section-stepper & {
		@media ( min-width: ${ plans2023MediumBreakpoint } ) {
			${ styles }
		}
	}

	.is-section-plans:not( .is-sidebar-collapsed ) & {
		@media ( min-width: ${ plans2023MediumWithSidebarBreakpoint } ) {
			${ styles }
		}
	}

	.is-section-plans.is-sidebar-collapsed & {
		@media ( min-width: ${ plans2023MediumBreakpoint } ) {
			${ styles }
		}
	}
`;

export const plansBreakLarge = ( styles: SerializedStyles ) => css`
	body.is-section-signup.is-white-signup &,
	body.is-section-stepper & {
		@media ( min-width: ${ plans2023LargeBreakpoint } ) {
			${ styles }
		}
	}

	.is-section-plans:not( .is-sidebar-collapsed ) & {
		@media ( min-width: ${ plans2023LargeWithSidebarBreakpoint } ) {
			${ styles }
		}
	}

	.is-section-plans.is-sidebar-collapsed & {
		@media ( min-width: ${ plans2023LargeBreakpoint } ) {
			${ styles }
		}
	}
`;
