import { checkoutTheme } from '@automattic/composite-checkout';
import type { Theme } from '@automattic/composite-checkout';

export const dashboardCheckoutTheme: Theme = {
	...checkoutTheme,
	colors: {
		...checkoutTheme.colors,
		background: 'var( --wpds-color-background-surface-neutral )',
		surface: 'var( --wpds-color-background-surface-neutral-strong )',
		primary: 'var( --wpds-color-background-interactive-brand-strong )',
		primaryOver: 'var( --wpds-color-background-interactive-brand-strong-active )',
		highlight: 'var( --wpds-color-foreground-interactive-brand )',
		highlightBorder: 'var( --wpds-color-stroke-interactive-brand )',
		highlightOver: 'var( --wpds-color-foreground-interactive-brand-active )',
		success: 'var( --wpds-color-foreground-content-success-weak )',
		discount: 'var( --wpds-color-foreground-content-success-weak )',
		disabledPaymentButtons: 'var( --wpds-color-background-interactive-brand-strong-disabled )',
		disabledPaymentButtonsAccent: 'var( --wpds-color-stroke-surface-neutral )',
		disabledButtons: 'var( --wpds-color-foreground-interactive-brand-strong-disabled )',
		borderColor: 'var( --wpds-color-stroke-surface-neutral )',
		borderColorLight: 'var( --wpds-color-stroke-surface-neutral )',
		borderColorDark: 'var( --wpds-color-stroke-surface-neutral-strong )',
		upcomingStepBackground: 'var( --wpds-color-background-surface-neutral-weak )',
		textColor: 'var( --wpds-color-foreground-content-neutral )',
		textColorLight: 'var( --wpds-color-foreground-content-neutral-weak )',
		textColorDark: 'var( --wpds-color-foreground-content-neutral )',
		textColorDisabled: 'var( --wpds-color-foreground-content-neutral-weak )',
		error: 'var( --wpds-color-foreground-content-error-weak )',
		disabledField: 'var( --wpds-color-background-surface-neutral-weak )',
		placeHolderTextColor: 'var( --wpds-color-foreground-content-neutral-weak )',
	},
};
