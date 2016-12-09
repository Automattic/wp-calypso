const DOMAIN_PURCHASE = {
	expiryStatus: 'active',
	id: 10001,
	isDomainRegistration: true,
	meta: 'foo.com',
	productName: 'Domain Registration',
	productSlug: 'domain_reg',
	isRefundable: true,
	isCancelable: true
};

const DOMAIN_PURCHASE_PENDING_TRANSFER = {
	expiryStatus: 'active',
	id: 10001,
	isDomainRegistration: true,
	meta: 'foo.com',
	productName: 'Domain Registration',
	productSlug: 'domain_reg',
	pendingTransfer: true
};

const DOMAIN_PURCHASE_EXPIRED = Object.assign( {}, DOMAIN_PURCHASE, {
	expiryStatus: 'expired',
	id: 10002,
	isCancelable: false
} );

const DOMAIN_PURCHASE_INCLUDED_IN_PLAN = Object.assign( {}, DOMAIN_PURCHASE, {
	id: 10004,
	expiryStatus: 'included'
} );

const DOMAIN_MAPPING_PURCHASE = {
	expiryStatus: 'active',
	id: 20001,
	isDomainRegistration: false,
	meta: 'boo.com',
	productName: 'Domain Mapping',
	productSlug: 'domain_map',
	isCancelable: true
};

const DOMAIN_MAPPING_PURCHASE_EXPIRED = Object.assign( {}, DOMAIN_MAPPING_PURCHASE, {
	expiryStatus: 'expired',
	id: 20002,
	isCancelable: false
} );

const SITE_REDIRECT_PURCHASE = {
	expiryStatus: 'active',
	id: 30001,
	isDomainRegistration: false,
	meta: '',
	productName: 'Site Redirect',
	productSlug: 'offsite_redirect',
	isCancelable: false
};

const SITE_REDIRECT_PURCHASE_EXPIRED = Object.assign( {}, SITE_REDIRECT_PURCHASE, {
	expiryStatus: 'expired',
	id: 30002
} );

const PLAN_PURCHASE = {
	expiryStatus: 'active',
	id: 40001,
	meta: '',
	productName: 'WordPress.com Premium',
	productSlug: 'value_bundle',
	isRefundable: true,
	isCancelable: true,
	isRenewable: true,
	isDomainRegistration: false
};

export default {
	DOMAIN_PURCHASE,
	DOMAIN_PURCHASE_PENDING_TRANSFER,
	DOMAIN_PURCHASE_EXPIRED,
	DOMAIN_PURCHASE_INCLUDED_IN_PLAN,
	DOMAIN_MAPPING_PURCHASE,
	DOMAIN_MAPPING_PURCHASE_EXPIRED,
	PLAN_PURCHASE,
	SITE_REDIRECT_PURCHASE,
	SITE_REDIRECT_PURCHASE_EXPIRED
};
