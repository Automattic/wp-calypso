export const credentials = {
	12345678: {
		protocol: 'sftp',
		host: 'somehost.com',
		port: 22,
		user: 'username',
		pass: 'a1b2c3d4e5f6',
		abspath: '/public_html/',
	},
	87654321: {
		protocol: 'ssh',
		host: 'somesite.org',
		port: 1022,
		user: 'auser',
		pass: '6f5e4d3c2b1a',
		abspath: '/var/www/somewhere.com'
	}
};

export const normalizedCredentials = {
	...credentials,
	12345678: {
		...credentials[ 12345678 ]
	}
};

export const requests = {
	12345678: {
		requesting: false,
		updating: true
	},
	87654321: {
		requesting: true,
		updating: false
	}
};
