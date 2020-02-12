/**
 * Internal dependencies
 */

/**
 * ⚠️😱 Calypso dependencies 😱⚠️
 */
import { untrailingslashit } from '../../lib/route';
import { urlToSlug } from '../../lib/url';

export const getSiteSlug = ( url: string ) => urlToSlug( untrailingslashit( url ) );
