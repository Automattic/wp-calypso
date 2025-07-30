/** @type {import('tailwindcss').Config} */
module.exports = {
	prefix: 'agnttc-',
	important: '.agenttic-ui',
	content: [
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {},
	},
	plugins: [],
	corePlugins: {
		preflight: false,
	},
}
