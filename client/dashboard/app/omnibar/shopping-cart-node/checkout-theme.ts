import { checkoutTheme } from '@automattic/composite-checkout';
import type { Theme } from '@automattic/composite-checkout';

/**
 * Returns a WPDS token for a checkout color, falling back to the default checkout color where the token isn't defined.
 */
function token( name: keyof Theme[ 'colors' ], wpdsToken: string ) {
	return `var( ${ wpdsToken }, ${ checkoutTheme.colors[ name ] } )`;
}

export const dashboardCheckoutTheme: Theme = {
	...checkoutTheme,
	colors: {
		...checkoutTheme.colors,
		background: token( 'background', '--wpds-color-background-surface-neutral' ),
		surface: token( 'surface', '--wpds-color-background-surface-neutral-strong' ),
		primary: token( 'primary', '--wpds-color-background-interactive-brand-strong' ),
		primaryOver: token( 'primaryOver', '--wpds-color-background-interactive-brand-strong-active' ),
		highlight: token( 'highlight', '--wpds-color-foreground-interactive-brand' ),
		highlightBorder: token( 'highlightBorder', '--wpds-color-stroke-interactive-brand' ),
		highlightOver: token( 'highlightOver', '--wpds-color-foreground-interactive-brand-active' ),
		success: token( 'success', '--wpds-color-foreground-content-success-weak' ),
		discount: token( 'discount', '--wpds-color-foreground-content-success-weak' ),
		disabledPaymentButtons: token(
			'disabledPaymentButtons',
			'--wpds-color-background-interactive-brand-strong-disabled'
		),
		disabledPaymentButtonsAccent: token(
			'disabledPaymentButtonsAccent',
			'--wpds-color-stroke-surface-neutral'
		),
		disabledButtons: token(
			'disabledButtons',
			'--wpds-color-foreground-interactive-brand-strong-disabled'
		),
		borderColor: token( 'borderColor', '--wpds-color-stroke-surface-neutral' ),
		borderColorLight: token( 'borderColorLight', '--wpds-color-stroke-surface-neutral' ),
		borderColorDark: token( 'borderColorDark', '--wpds-color-stroke-surface-neutral-strong' ),
		upcomingStepBackground: token(
			'upcomingStepBackground',
			'--wpds-color-background-surface-neutral-weak'
		),
		textColor: token( 'textColor', '--wpds-color-foreground-content-neutral' ),
		textColorLight: token( 'textColorLight', '--wpds-color-foreground-content-neutral-weak' ),
		textColorDark: token( 'textColorDark', '--wpds-color-foreground-content-neutral' ),
		textColorDisabled: token( 'textColorDisabled', '--wpds-color-foreground-content-neutral-weak' ),
		error: token( 'error', '--wpds-color-foreground-content-error-weak' ),
		warningBackground: token( 'warningBackground', '--wpds-color-background-surface-error-weak' ),
		outline: token( 'outline', '--wpds-color-stroke-focus' ),
		textColorOnDarkBackground: token(
			'textColorOnDarkBackground',
			'--wpds-color-background-surface-neutral-strong'
		),
		modalBackground: `color-mix( in srgb, ${ token(
			'background',
			'--wpds-color-background-surface-neutral'
		) } 90%, transparent )`,
		disabledField: token( 'disabledField', '--wpds-color-background-surface-neutral-weak' ),
		placeHolderTextColor: token(
			'placeHolderTextColor',
			'--wpds-color-foreground-content-neutral-weak'
		),
	},
};
