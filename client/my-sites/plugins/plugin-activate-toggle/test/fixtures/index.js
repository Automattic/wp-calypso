const exported = {
    site: {
		slug: 'test',
		domain: '',
		name: ''
	},

    plugin: {
		slug: 'test'
	},

    notices: {
		completed: [],
		errors: []
	},

    action: function() {}
};

export default exported;

export const {
    site,
    plugin,
    notices,
    action
} = exported;
