import { __ } from '@wordpress/i18n';
import type { Redesign } from './api';

/** `applyOnly`: back from a paid checkout, where only the existing design may be used. */
type RedesignHost = { run: Redesign; applyOnly?: boolean };
let activeHost: RedesignHost | null = null;
export function connectRedesignHost( host: RedesignHost ) {
	activeHost = host;
	return () => {
		if ( activeHost === host ) {
			activeHost = null;
		}
	};
}

export function createRedesignProvider( getSiteId: () => number | undefined ) {
	const siteId = getSiteId();
	// Fixed for this provider's life: a fresh run gets a fresh provider, never this one.
	const redesignId =
		activeHost && activeHost.run.site_id === siteId ? activeHost.run.id : undefined;
	return {
		capabilities: { unmeteredChat: true, themeIndependentSuggestions: true },
		providerId: 'site-redesign',
		contextProvider: {
			ownsEnvironment: true,
			getClientContext: () => {
				const run =
					activeHost &&
					activeHost.run.site_id === siteId &&
					activeHost.run.id === redesignId &&
					getSiteId() === siteId
						? activeHost.run
						: null;
				return {
					url: window.location.href,
					pathname: window.location.pathname,
					search: window.location.search,
					environment: 'site-redesign',
					site_redesign: run
						? { redesign_id: run.id, site_id: run.site_id, status: run.status }
						: null,
				};
			},
		},
		suppressEmptyViewDefaults: true,
		getEmptyViewSuggestions: () =>
			activeHost?.applyOnly && activeHost.run.site_id === siteId
				? [
						{
							id: 'site-redesign-review',
							label: __( 'Review my design' ),
							prompt: __( 'Summarize the design you made for my site before I use it.' ),
						},
					]
				: [
						{
							id: 'site-redesign-interview',
							label: __( 'Start designing' ),
							prompt: __( 'Help me redesign my existing site.' ),
						},
					],
	};
}
