import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';

// Returns props for the support link based on the current environment
export function getSupportLinkProps() {
	return {
		showIcon: false,
		supportContext: isA8CForAgencies() ? 'a4a-site-performance' : 'site-performance',
		showSupportModal: ! isA8CForAgencies(),
		supportLink:
			isA8CForAgencies() &&
			'https://agencieshelp.automattic.com/knowledge-base/check-your-sites-performance',
	};
}
