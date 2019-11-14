export const items = {
	12345678: {
		isActive: false,
		isStaging: false,
		devMode: {
			isActive: false,
			constant: false,
			url: false,
			filter: false,
		},
	},
	87654321: {
		isActive: true,
		isStaging: true,
		devMode: {
			isActive: true,
			constant: false,
			url: false,
			filter: true,
		},
	},
	987654321: {
		isActive: true,
		isStaging: true,
		devMode: {
			isActive: 0,
			constant: false,
			url: false,
			filter: true,
		},
	},
};

export const requests = {
	12345678: false,
	87654321: true,
};

export const dataItems = {
	12345678: {
		gravatar: '<img />',
		isConnected: true,
		isMaster: true,
		permissions: {
			edit_posts: true,
		},
		username: 'automattic',
		wpcomUser: {
			ID: 12345678,
			login: 'automattic',
		},
	},
	87654321: {
		gravatar: '<img />',
		isConnected: true,
		isMaster: false,
		permissions: {
			edit_posts: true,
		},
		username: 'automattic',
		wpcomUser: {
			ID: 12345678,
			login: 'automattic',
		},
	},
};
