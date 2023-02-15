import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';

const sidebarWidth = 272; //in px
const plans2023SmallBreakpoint = '880px';
const plans2023MediumBreakpoint = '1340px';
const plans2023LargeBreakpoint = '1500px';
const plans2023SmallWithSidebarBreakpoint = `${ 880 + sidebarWidth }px`;
const plans2023MediumWithSidebarBreakpoint = `${ 1340 + sidebarWidth }px`;
const plans2023LargeWithSidebarBreakpoint = `${ 1500 + sidebarWidth }px`;

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
