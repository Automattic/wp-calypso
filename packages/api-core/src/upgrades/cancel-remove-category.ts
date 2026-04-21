/**
 * Cross-surface taxonomy for Cancel / Remove button copy on Purchase
 * Settings. Each surface (legacy and dashboard) classifies its own
 * `Purchase` shape into one of these categories, then uses that category
 * to pick the right English copy in its own i18n helper.
 */
export type CancelRemoveCategory = 'plan' | 'domain' | 'email' | 'other';
