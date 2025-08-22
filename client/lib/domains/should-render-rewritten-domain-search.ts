import config from '@automattic/calypso-config';

export const shouldRenderRewrittenDomainSearch = () => {
	return config.isEnabled( 'domain-search-rewrite' );
};
