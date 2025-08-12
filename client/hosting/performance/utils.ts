import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';

export function isValidURL( url: string ) {
	if ( 'canParse' in URL ) {
		return URL.canParse( url );
	}
	return /^(https?:\/\/)?((?!false\.)([a-z0-9-]+\.)+)[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test(
		url
	);
}

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
