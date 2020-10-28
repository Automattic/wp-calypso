/**
 * Internal dependencies
 */
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export interface CartData {
	products: Array< {
		product_id: number;
		product_slug: string;
	} >;
}

export type Props = {
	site: SiteData;
	cartData: CartData;
	onClose: () => void;
	isOpen: boolean;
};
