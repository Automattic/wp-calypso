export const STORE_KEY = 'automattic/help-center';
export const PREFERENCES_KEY = 'logged_out_help_center_preferences_';
// Set by the wpcom launcher on the pricing page so the assistant greets visitors as a pre-sales guide.
export const PLANS_PRESALES_LAUNCHER_CONTEXT = 'plans-presales';
// Variations of the checkout support routing experiment, set when support is opened from checkout.
export const CHECKOUT_SUPPORT_VARIATIONS = [ 'control', 'human_only', 'hybrid' ] as const;
