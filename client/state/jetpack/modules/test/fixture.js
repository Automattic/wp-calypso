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
	123456: {
		'module-a': {
			activating: false,
			deactivating: true,
		},
		'module-b': {
			activating: true,
			deactivating: false
		},
		fetchingModules: true
	},
	654321: {
		fetchingModules: false
	}
};

export const api_module_list_response = {
	data: {
		'module-a': {
			module: 'module-a',
			activated: false
		},
		'module-b': {
			module: 'module-b',
			activated: true,
			options: {
				c: {
					currentValue: 2
				}
			}
		}
	}
};

export const moduleData = {
	'module-a': {
		module: 'module-a',
		active: false,
		name: 'Module A',
		description: 'Just another awesome module',
		sort: 1,
		introduced: '1.0',
		changed: '',
		free: true,
		module_tags: [ 'Test tag' ]
	},
	'module-b': {
		module: 'module-b',
		active: true,
		name: 'Module A',
		description: 'Just another awesome module',
		sort: 1,
		introduced: '1.0',
		changed: '',
		free: true,
		module_tags: [ 'Test tag' ]
	}
};
