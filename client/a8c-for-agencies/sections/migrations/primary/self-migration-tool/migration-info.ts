export const getMigrationInfo = (
	type: 'pressable' | 'wpcom',
	translate: ( key: string ) => string
) => {
	const steps = {
		pressable: {
			pageTitle: translate( 'Migrations: Migrate to Pressable' ),
			heading: translate( 'Migrate to Pressable' ),
		},
		wpcom: {
			pageTitle: translate( 'Migrations: Migrate to WordPress.com' ),
			heading: translate( 'Migrate to WordPress.com' ),
		},
	};
	return steps?.[ type ];
};
