const exported = {
    site: {
		slug: 'test',
		domain: '',
		name: '',
		canUpdateFiles: true,
		options: { file_mod_disabled: false },
		jetpack: true
	},

    plugin: { slug: 'test' },

    notices: {
		completed: [],
		errors: []
	},

    wporg: true,
    action: function() {}
};

export default exported;

export const {
    site,
    plugin,
    notices,
    wporg,
    action
} = exported;
