export const modules = {
	123456: {
		'module-a': {
			module: 'module-a',
			active: false
		},
		'module-b': {
			module: 'module-b',
			active: true,
			options: {
				c: {
					currentValue: 2
				}
			}
		}
	}
};

export const requests = {
	activating: {
		123456: {
			'module-a': false,
			'module-b': true
		}
	}
};
