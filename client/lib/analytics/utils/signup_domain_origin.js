export const SIGNUP_DOMAIN_ORIGIN = {
	use_your_domain: 'use your domain',
	choose_later: 'choose later',
	free: 'free',
	custom: 'custom',
	not_set: 'not set',
};

const SIGNUP_DOMAIN_ORIGIN_KEY = 'SIGNUP_DOMAIN_ORIGIN';

export function getDomainOrigin() {
	return window.localStorage.getItem( SIGNUP_DOMAIN_ORIGIN_KEY ) || SIGNUP_DOMAIN_ORIGIN.not_set;
}

export function setDomainOrigin( origin ) {
	window.localStorage.setItem( SIGNUP_DOMAIN_ORIGIN_KEY, origin );
}

export function removeDomainOrigin() {
	window.localStorage.removeItem( SIGNUP_DOMAIN_ORIGIN_KEY );
}
