import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';

export const plansGridMediumLarge = ( styles: SerializedStyles ) => css`
	.plans-grid-next.is-smedium &,
	.plans-grid-next.is-medium &,
	.plans-grid-next.is-large &,
	.plans-grid-next.is-xlarge & {
		${ styles }
	}
`;
