/**
 * Spot illustrations for the "Browse by" tiles and the section headings,
 * drawn in Figma (MSD - Information Architecture, "Marketplace Graphics",
 * Category spots) in black and grey, so colour on the page only ever means a
 * brand (the product cards carry it). Keyed by job; `more` is for everything
 * without one.
 */
import conversion from './conversion.svg';
import customerService from './customer-service.svg';
import growth from './growth.svg';
import merchandising from './merchandising.svg';
import more from './more.svg';
import payments from './payments.svg';
import performance from './performance.svg';
import security from './security.svg';
import shipping from './shipping.svg';
import social from './social.svg';
import storeContent from './store-content.svg';
import storeManagement from './store-management.svg';

export const SPOTS = {
	payments,
	security,
	performance,
	social,
	growth,
	shipping,
	conversion,
	'customer-service': customerService,
	merchandising,
	'store-content': storeContent,
	'store-management': storeManagement,
	more,
};

export type SpotKey = keyof typeof SPOTS;
