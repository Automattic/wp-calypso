import { untrailingslashit } from 'calypso/lib/route';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function getDomainOrProductFromContext( { params, store }: PageJS.Context ): string {
	const { domainOrProduct, product } = params;
	const state = store.getState();
	const selectedSite = getSelectedSite( state );

	let result;

	if ( selectedSite?.slug !== domainOrProduct && domainOrProduct ) {
		result = domainOrProduct;
	} else {
		result = product;
	}

	return result || '';
}

/**
 * Prepends "http(s)" to user-supplied URL if protocol is missing.
 *
 * @param {string} inputUrl User-supplied URL
 * @param {?boolean} httpsIsDefault Default to 'https' if true vs 'http' if false
 * @returns {string} URL string with http(s) included
 */
export function addHttpIfMissing( inputUrl: string, httpsIsDefault = true ): string {
	const scheme = httpsIsDefault ? 'https' : 'http';
	let url = inputUrl.trim().toLowerCase();

	if ( url && url.substr( 0, 4 ) !== 'http' ) {
		url = `${ scheme }://` + url;
	}
	return untrailingslashit( url );
}

function addMonths( date: Date, months: number ) {
	const d = date.getDate();
	date.setMonth( date.getMonth() + months );
	if ( date.getDate() !== d ) {
		date.setDate( 0 );
	}
	return date;
}

/**
 * We calculate the price for a year subscription, given how many months we are going to offer for free.
 * It takes into account leap years, and months like february.
 *
 * Example: If we give 3 months for free in February, for a product that cost 35$ yearly then we return the price
 * that we need to bill after those 3 months for the rest of the year.
 *
 * @param productCost
 * @param freeMonths
 * @param startDate
 */
export function getProratedPrice(
	productCost: number,
	freeMonths: number,
	startDate: Date = new Date()
): number {
	const now = startDate;
	const freeTime = addMonths( new Date( startDate ), freeMonths ).getTime();
	const nextYearDate = addMonths( new Date( startDate ), 12 );
	const diff = nextYearDate.getTime() - freeTime;
	const diffDays = ( nextYearDate.getTime() - now.getTime() ) / 86400000 - diff / 86400000;
	const price = ( 365 - Math.round( diffDays ) ) / 365;
	return price * productCost;
}
