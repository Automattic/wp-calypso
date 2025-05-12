const THEMES = {
	// Jetpack Color Theme
	jetpack: {
		'--jetpack-white-off': '#f9f9f6',
		'--color-primary': 'var(--studio-jetpack-green)',
		'--color-primary-dark': 'var(--studio-jetpack-green-70)',
		'--color-primary-light': 'var(--studio-jetpack-green-30)',
		'--color-primary-0': 'var(--studio-jetpack-green-0)',
		'--color-primary-5': 'var(--studio-jetpack-green-5)',
		'--color-primary-10': 'var(--studio-jetpack-green-10)',
		'--color-primary-20': 'var(--studio-jetpack-green-20)',
		'--color-primary-30': 'var(--studio-jetpack-green-30)',
		'--color-primary-40': 'var(--studio-jetpack-green-40)',
		'--color-primary-50': 'var(--studio-jetpack-green-50)',
		'--color-primary-60': 'var(--studio-jetpack-green-60)',
		'--color-primary-70': 'var(--studio-jetpack-green-70)',
		'--color-primary-80': 'var(--studio-jetpack-green-80)',
		'--color-primary-90': 'var(--studio-jetpack-green-90)',
		'--color-primary-100': 'var(--studio-jetpack-green-100)',

		// Theme Properties
		'--color-accent': 'var(--studio-black)',
		'--color-accent-dark': 'var(--studio-gray-90)',
		'--color-accent-light': 'var(--studio-gray-50)',
		'--color-accent-0': 'var(--studio-gray-0)',
		'--color-accent-5': 'var(--studio-gray-5)',
		'--color-accent-10': 'var(--studio-gray-10)',
		'--color-accent-20': 'var(--studio-gray-20)',
		'--color-accent-30': 'var(--studio-gray-30)',
		'--color-accent-40': 'var(--studio-gray-40)',
		'--color-accent-50': 'var(--studio-gray-50)',
		'--color-accent-60': 'var(--studio-gray-60)',
		'--color-accent-70': 'var(--studio-gray-70)',
		'--color-accent-80': 'var(--studio-gray-80)',
		'--color-accent-90': 'var(--studio-gray-90)',
		'--color-accent-100': 'var(--studio-gray-100)',

		'--theme-highlight-color': 'var(--color-primary-50)',
	},
	// WordPress.com Color Theme
	wpcom: {},
	// WooCommerce Color Theme
	woo: {},
};

export default ( themeName = 'jetpack' ) => {
	return THEMES[ themeName ] || THEMES.jetpack;
};
