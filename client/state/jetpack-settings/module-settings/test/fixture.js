export const moduleSettings = {
	'module-a': {
		setting_1: 1234,
		setting_2: true,
		setting_3: 'some_value',
	},
	'module-b': {
		setting_1: 1234,
		setting_2: {
			setting_3: 'some_value',
		}
	}
};

export const requests = {
	12345678: {
		'module-a': {
			requesting: false,
			updating: true,
		},
		'module-b': {
			requesting: true,
			updating: false
		}
	}
};
