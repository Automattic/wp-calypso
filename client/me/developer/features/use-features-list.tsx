import { useTranslate } from 'i18n-calypso';

export const useFeaturesList = () => {
	const translate = useTranslate();

	return [
		{
			title: translate( 'SSH, WP-CLI, and GIT' ),
			description: translate(
				'Run WP-CLI commands, automate repetitive tasks and troubleshoot your custom code. All that with the tools you already use.'
			),
			linkLearnMore: '#',
		},
		{
			title: translate( 'Staging sites' ),
			description: translate(
				'Test changes on a WordPress.com staging site first, so you can identify and fix any vulnerabilities before they impact your live site.'
			),
			linkLearnMore: '#',
		},
		{
			title: translate( 'Real-time activity log' ),
			description: translate(
				'Stay on top of everything that happens on your site with our real-time activity log. If it happened, you’ll know about it. '
			),
			linkLearnMore: '#',
		},
		{
			title: translate( 'DDOS and WAF protection' ),
			description: translate(
				'WordPress.com blocks millions of malicious requests daily so you can sleep through takeover and hacking attempts.'
			),
			linkLearnMore: '#',
		},
		{
			title: translate( 'Free SSL certificates' ),
			description: translate(
				'Take your site from HTTP to HTTPS at no additional cost with a free SSL certificate.'
			),
			linkLearnMore: '#',
		},
		{
			title: translate( 'Malware scanning and removal' ),
			description: translate(
				'Stay one step ahead of security threats with automated malware scanning and one-click fixes.'
			),
			linkLearnMore: '#',
		},
	];
};
