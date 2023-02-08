import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';

const sidebarWidth = 272; //in px
export const plans2023SmallBreakpoint = '880px';
export const plans2023MediumBreakpoint = '1340px';
export const plans2023LargeBreakpoint = '1500px';
export const plans2023SmallWithSidebarBreakpoint = `${ 880 + sidebarWidth }px`;
export const plans2023MediumWithSidebarBreakpoint = `${ 1340 + sidebarWidth }px`;
export const plans2023LargeWithSidebarBreakpoint = `${ 1500 + sidebarWidth }px`;

export const plansBreakSmall = ( styles: SerializedStyles ) => css`
	body.is-section-signup.is-white-signup & {
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
	body.is-section-signup.is-white-signup & {
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
	body.is-section-signup.is-white-signup & {
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
