export function unstableResourceWarning( resourceName: string, link?: string ) {
	const baseMessage = `%c🚨 [@automattic/site-admin] Temporary Resource!\n%c${ resourceName } %cis is a temporary (copy) implementation.\nReplace it with the core implementation once it becomes available.`;
	const linkMessage = link ? `\n%c${ link }%c` : '';

	// eslint-disable-next-line no-console
	console.log(
		`${ baseMessage }${ linkMessage }`,
		'color: #f44;',
		'color: orange; font-weight: bold; font-size: 12px;',
		'font-weight: normal; color: #aa9900;',
		link ? 'color: #aa9900' : '',
		link ? 'color: #007abb;' : ''
	);
}
