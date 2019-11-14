export const settings = {
	12345678: {
		setting_1: 4321,
		setting_2: false,
		setting_10: 'test',
		wp_mobile_excerpt: 'disabled',
		wp_mobile_featured_images: 'enabled',
	},
	87654321: {
		setting_1: 1234,
		setting_2: true,
		setting_3: {
			setting_4: 'some_value',
		},
	},
};

export const normalizedSettings = {
	...settings,
	12345678: {
		...settings[ 12345678 ],
		wp_mobile_excerpt: false,
		wp_mobile_featured_images: true,
	},
};
