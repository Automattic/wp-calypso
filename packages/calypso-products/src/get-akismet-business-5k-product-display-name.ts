import { formatAkismetDisplayName } from './format-akismet-display-name';

// The "5k" in this filename / function name is legacy naming retained for
// backend product-slug stability (ak_bus5k_*). The actual allotment is now
// 80000 requests/month, not 5K.
const AKISMET_BUSINESS_REQUESTS_PER_MONTH = 80000;

export function getAkismetBusiness5kProductDisplayName( productName: string ) {
	return formatAkismetDisplayName( productName, AKISMET_BUSINESS_REQUESTS_PER_MONTH / 1000 );
}
