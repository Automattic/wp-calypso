import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';

const sidebarWidth = 272; //in px
const plansPageSmallBreakpoint = '780px';
const plansPageSmallWithSidebarBreakpoint = `${ 780 + sidebarWidth }px`;

/**
 * Use this sparingly for plans page/section layout purposes.
 * IMPORTANT: The plans grids do not rely on the same media queries and breakpoints for their rendering.
 */
export const plansPageBreakSmall = ( styles: SerializedStyles ) => css`
	body.is-section-signup.is-white-signup &,
	body.is-section-stepper & {
		@media ( min-width: ${ plansPageSmallBreakpoint } ) {
			${ styles }
		}
	}

	.is-section-plans:not( .is-sidebar-collapsed ) & {
		@media ( min-width: ${ plansPageSmallWithSidebarBreakpoint } ) {
			${ styles }
		}
	}

	.is-section-plans.is-sidebar-collapsed & {
		@media ( min-width: ${ plansPageSmallBreakpoint } ) {
			${ styles }
		}
	}
`;
