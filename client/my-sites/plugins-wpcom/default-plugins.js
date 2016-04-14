import i18n from 'lib/mixins/i18n';

export const defaultBusinessPlugins = [
	{
		name: i18n.translate( 'Google Analytics' ),
		descriptionLink: '/plans/features/{siteSlug}',
		icon: 'stats',
		plan: 'Business',
		description: i18n.translate( 'Advanced features to complement WordPress.com stats. Funnel reports, goal conversion, and more.' )
	}
];
