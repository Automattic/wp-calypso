export const items = {
	12345678: {
		isActive: true,
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
};

export const requests = {
	12345678: false,
	87654321: true,
};
