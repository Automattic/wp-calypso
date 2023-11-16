export type SPECIAL_DOMAIN_CATEGORY =
	| 'wordpress-com'
	| 'wordpress-org'
	| 'automattic-com'
	| 'tumblr-com'
	| 'gravatar-com'
	| 'akismet-com'
	| 'genaral-a8c-properties'
	| 'wpcom-sp'
	| 'local-development';

export function getDomainCategory( domain: string ): SPECIAL_DOMAIN_CATEGORY | undefined {
	const domain_lc = domain.toLowerCase();
	let specialDomainCase: SPECIAL_DOMAIN_CATEGORY | undefined;

	switch ( domain_lc ) {
		case 'wordpress.com':
			specialDomainCase = 'wordpress-com';
			break;
		case 'wordpress.org':
			specialDomainCase = 'wordpress-org';
			break;
		case 'automattic.com':
			specialDomainCase = 'automattic-com';
			break;
		case 'tumblr.com':
			specialDomainCase = 'tumblr-com';
			break;
		case 'gravatar.com':
			specialDomainCase = 'gravatar-com';
			break;
		case 'akismet.com':
			specialDomainCase = 'akismet-com';
			break;
		case 'wordpress.com/site-profiler':
			specialDomainCase = 'wpcom-sp';
			break;
		case 'localhost':
		case '127.0.0.1':
			specialDomainCase = 'local-development';
			break;
		case 'wpvip.com':
		case 'longreads.com':
		case 'happy.tools':
		case 'simplenote.com':
		case 'jetpack.com':
		case 'woocommerce.com':
		case 'dayoneapp.com':
			specialDomainCase = 'genaral-a8c-properties';
			break;
		default:
			specialDomainCase = undefined;
			break;
	}

	return specialDomainCase;
}
