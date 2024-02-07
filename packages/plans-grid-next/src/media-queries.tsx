import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';

const sidebarWidth = 272; //in px
const plans2023SmallBreakpoint = '780px';
const plans2023SmallWithSidebarBreakpoint = `${ 780 + sidebarWidth }px`;

/**
 * @deprecated
 * TODO clk Used in comparison-grid-toggle and plans-features-main
 */
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
