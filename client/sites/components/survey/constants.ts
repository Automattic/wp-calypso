import surveySitesDashboardImage from './assets/images/survey-sites-dashboard.svg';

type SurveyContentProps = {
	title: string;
	description: string;
	image: string;
	imageAlt: string;
	href: string;
};

export const SURVEY_SITES_DASHBOARD = 'survey-sites-dashboard';

// English-locale only. No need for translation.
const SURVEY_SITES_DASHBOARD_CONTENT: SurveyContentProps = {
	title: 'Shape the Future of WordPress.com',
	description:
		'Got a minute? We’d love to get your feedback on some upcoming changes to the WordPress.com dashboard.',
	image: surveySitesDashboardImage,
	imageAlt: 'WordPress.com dashboard',
	href: 'https://wordpressdotcom.crowdsignal.net/wordpress-com-dashboard-feedback',
};

export const SURVEYS: Record< string, SurveyContentProps > = {
	[ SURVEY_SITES_DASHBOARD ]: SURVEY_SITES_DASHBOARD_CONTENT,
};
