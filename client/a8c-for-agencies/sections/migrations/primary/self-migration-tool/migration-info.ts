const dummySteps = [
	{
		stepId: 'step-1',
		count: 1,
		title: 'Dummy Title 1',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		buttonProps: {
			variant: 'primary',
			label: 'Dummy Label 1',
			href: '',
		},
	},
	{
		stepId: 'step-2',
		count: 2,
		title: 'Dummy Title 2',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		buttonProps: {
			variant: 'primary',
			label: 'Dummy Label 2',
			href: '',
		},
	},
	{
		stepId: 'step-3',
		count: 3,
		title: 'Dummy Title 3',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		buttonProps: {
			variant: 'primary',
			label: 'Dummy Label 3',
			href: '',
		},
	},
	{
		stepId: 'step-4',
		count: 4,
		title: 'Dummy Title 4',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		buttonProps: {
			variant: 'primary',
			label: 'Dummy Label 4',
			href: '',
		},
	},
];
export const getMigrationInfo = (
	type: 'pressable' | 'wpcom',
	translate: ( key: string ) => string
) => {
	const steps = {
		pressable: {
			pageTitle: translate( 'Migrations: Migrate to Pressable' ),
			heading: translate( 'Migrate to Pressable' ),
			pageHeading: translate( 'Transfer your WordPress website to Pressable on your own.' ),
			pageSubheading:
				"Move your site and tag it for potential earnings by following these steps. If you need help finishing the transfer, don't hesitate to contact us.",
			steps: dummySteps,
			sessionStorageKey: 'a4a_self_migrate_to_pressable_steps',
		},
		wpcom: {
			pageTitle: translate( 'Migrations: Migrate to WordPress.com' ),
			heading: translate( 'Migrate to WordPress.com' ),
			pageHeading: translate( 'Transfer your WordPress website to WordPress.com on your own.' ),
			pageSubheading:
				"Move your site and tag it for potential earnings by following these steps. If you need help finishing the transfer, don't hesitate to contact us.",
			steps: dummySteps,
			sessionStorageKey: 'a4a_self_migrate_to_wpcom_steps',
		},
	};
	return steps?.[ type ];
};
