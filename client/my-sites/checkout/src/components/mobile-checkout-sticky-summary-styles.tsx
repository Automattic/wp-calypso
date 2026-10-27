import { css } from '@emotion/react';

/**
 * Repositions the radio dot drawn by composite-checkout's `RadioButton` into the
 * 16px gutter the mobile sticky summary experiment uses, and centres it in the
 * row.
 *
 * The primitive draws the outer circle as `label::before` and the inner dot as
 * `label::after`, positioned with physical `left` plus a `.rtl &` block that
 * swaps to `right`. Logical properties handle both directions on their own, so
 * `inset-inline-end: auto` is all that is needed to clear whichever physical
 * side the primitive set. Callers select the label; both of the experiment's
 * selectors are one element more specific than the primitive's `.rtl &` rule, so
 * this wins the cascade in RTL too.
 *
 * Row padding is deliberately not included — the payment-method rows and the
 * term-variation rows use different inline padding.
 */
export const mobileCheckoutStickySummaryRadioDotStyles = css`
	&::before {
		inset-inline-start: 16px;
		inset-inline-end: auto;
		inset-block-start: 50%;
		transform: translateY( -50% );
	}

	&::after {
		inset-inline-start: 20px;
		inset-inline-end: auto;
		inset-block-start: 50%;
		margin-block-start: 0;
		transform: translateY( -50% );
	}
`;
