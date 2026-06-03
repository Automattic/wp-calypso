import { formatAkismetDisplayName } from './format-akismet-display-name';

// The "500" in this filename / function name is legacy naming retained for
// backend product-slug stability (ak_pro5h_*). The actual per-quantity allotment
// is now 8000 requests/month, not 500.
const AKISMET_PRO_REQUESTS_PER_QUANTITY = 8000;

export function getAkismetPro500ProductDisplayName( productName: string, quantity: number | null ) {
	if ( ! quantity || quantity < 1 ) {
		return productName;
	}

	return formatAkismetDisplayName(
		productName,
		( AKISMET_PRO_REQUESTS_PER_QUANTITY * quantity ) / 1000
	);
}
