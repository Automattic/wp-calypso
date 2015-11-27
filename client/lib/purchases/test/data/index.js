const DOMAIN_PURCHASE = {
	expiryStatus: 'active',
	id: 10001,
	isDomainRegistration: true,
	meta: 'foo.com',
	productName: 'Domain Registration',
	productSlug: 'domain_reg'
};

const DOMAIN_PURCHASE_EXPIRED = Object.assign( {}, DOMAIN_PURCHASE, {
	expiryStatus: 'expired',
	id: 10002
} );

const DOMAIN_MAPPING_PURCHASE = {
	expiryStatus: 'active',
	id: 20001,
	isDomainRegistration: false,
	meta: 'boo.com',
	productName: 'Domain Mapping',
	productSlug: 'domain_map'
};

const DOMAIN_MAPPING_PURCHASE_EXPIRED = Object.assign( {}, DOMAIN_MAPPING_PURCHASE, {
	expiryStatus: 'expired',
	id: 20002
} );

const SITE_REDIRECT_PURCHASE = {
	expiryStatus: 'active',
	id: 30001,
	isDomainRegistration: false,
	meta: '',
	productName: 'Site Redirect',
	productSlug: 'offsite_redirect'
};

const SITE_REDIRECT_PURCHASE_EXPIRED = Object.assign( {}, SITE_REDIRECT_PURCHASE, {
	expiryStatus: 'expired',
	id: 30002
} );

export default {
	DOMAIN_PURCHASE,
	DOMAIN_PURCHASE_EXPIRED,
	DOMAIN_MAPPING_PURCHASE,
	DOMAIN_MAPPING_PURCHASE_EXPIRED,
	SITE_REDIRECT_PURCHASE,
	SITE_REDIRECT_PURCHASE_EXPIRED
}
