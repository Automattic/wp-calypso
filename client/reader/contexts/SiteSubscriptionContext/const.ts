/**
 * Possible paths from the site subscription page. They're relative to this page.
 * Why the SiteSubscriptionContextProps.navigate callback prop and the `Path` enum?
 * - Both the Calypso client and the landing/subscriptions app use the subscription page.
 * - They have different ways to handle routing (pagejs and react-router-dom respectively), so we need different paths.
 */
export const enum Path {
	ManageAllSubscriptions = 'manageAllSubscriptions',
}
