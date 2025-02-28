import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';

const sidebarWidth = 272; //in px
const plansPageSmallBreakpoint = '780px';
const plansPageSmallWithSidebarBreakpoint = `${ 780 + sidebarWidth }px`;

/**
 * Use this sparingly and primarily for general plans page (section) layout purposes.
 * IMPORTANT: The grid components (features-grid, comparison-grid, etc.) from `plans-grid-next` package
 * do not rely on screen media queries and breakpoints for their rendering. They are responsive
 * based on the container width and the number of columns. For grid-related changes across different
 * screen sizes, it might be best to use the mixins defined in `plans-grid-next`.
 */
export const plansPageBreakSmall = ( styles: SerializedStyles ) => css`
	body.is-section-signup &,
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
