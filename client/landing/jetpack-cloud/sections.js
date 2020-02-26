module.exports = [
	{
		name: 'jetpack-cloud',
		paths: [ '/', '/scan', '/backups', '/settings' ],
		module: 'landing/jetpack-cloud',
		secondary: true,
		group: 'jetpack-cloud',
		enableLoggedOut: true,
	}
];
