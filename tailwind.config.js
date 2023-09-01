/** @type {import('tailwindcss').Config} */
module.exports = {
	content: {
		relative: true,
		files: [ './client/my-sites/hosting/**/*{.html,.js,.ts,.jsx,.tsx}' ],
	},
	corePlugins: {
		preflight: false,
	},
	theme: {
		extend: {
			spacing: {
				4.5: '1.125rem',
			},
		},
	},
	plugins: [],
};
