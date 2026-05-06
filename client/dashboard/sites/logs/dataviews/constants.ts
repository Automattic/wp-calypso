export const VALUES_CACHED = [ 'false', 'true' ] as const;
export const VALUES_RENDERER = [ 'php', 'static' ] as const;
export const VALUES_REQUEST_TYPE = [ 'GET', 'HEAD', 'POST', 'PUT', 'DELETE' ] as const;
export const VALUES_SEVERITY = [ 'User', 'Warning', 'Deprecated', 'Fatal error' ] as const;
export const VALUES_STATUS = [
	'200',
	'301',
	'302',
	'400',
	'401',
	'403',
	'404',
	'429',
	'500',
] as const;
