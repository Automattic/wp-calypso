import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

export const useFeaturesList = () => {
	const translate = useTranslate();

	return [
		{
			title: translate( 'SFTP, SSH, and WP-CLI', {
				comment: 'Feature title for developers on WordPress.com',
			} ),
			description: translate(
				'Run WP-CLI commands, automate repetitive tasks, and troubleshoot your custom code with the tools you already use.',
				{
					comment: 'Description of feature "SFTP, SSH, and WP-CLI" for developers on WordPress.com',
				}
			),
			linkLearnMore: localizeUrl( '/support/connect-to-ssh-on-wordpress-com' ),
		},
		{
			title: translate( 'Staging sites', {
				comment: 'Feature title for developers on WordPress.com',
			} ),
			description: translate(
				'Test changes on a WordPress.com staging site first, so you can identify and fix any vulnerabilities before they impact your live site.',
				{
					comment: 'Description of feature "Staging sites" for developers on WordPress.com',
				}
			),
			linkLearnMore: localizeUrl( '/support/how-to-create-a-staging-site/' ),
		},
		{
			title: translate( 'Custom code', {
				comment: 'Feature title for developers on WordPress.com',
			} ),
			description: translate(
				'Build anything with support and automatic updates for 50,000+ plugins and themes. Or start from scratch with your own custom code.',
				{
					comment: 'Description of feature "Custom code" for developers on WordPress.com',
				}
			),
			linkLearnMore: localizeUrl( '/support/code' ),
		},
		{
			title: translate( 'Free SSL certificates', {
				comment: 'Feature title for developers on WordPress.com',
			} ),
			description: translate(
				'Take your site from HTTP to HTTPS at no additional cost. We encrypt every domain registered and connected to WordPress.com with a free SSL certificate.',
				{
					comment: 'Description of feature "Free SSL certificates" for developers on WordPress.com',
				}
			),
			linkLearnMore: localizeUrl( '/support/domains/https-ssl' ),
		},
		{
			title: translate( '24/7 expert support', {
				comment: 'Feature title for developers on WordPress.com',
			} ),
			description: translate(
				"Whenever you're stuck, whatever you're trying to make happen—our Happiness Engineers have the answers.",
				{
					comment: 'Description of feature "24/7 expert support" for developers on WordPress.com',
				}
			),
			linkLearnMore: localizeUrl( '/support/help-support-options' ),
		},
		{
			title: translate( 'Malware scanning and removal', {
				comment: 'Feature title for developers on WordPress.com',
			} ),
			description: translate(
				'Secure and maintain your site effortlessly with {{backupsLink}}real-time backups{{/backupsLink}}, advanced {{malwareScanningLink}}malware scanning and removal{{/malwareScanningLink}}, and continuous {{siteMonitoringLink}}site monitoring{{/siteMonitoringLink}}—ensuring peak performance and security at all times.',
				{
					comment:
						'Description of feature "Malware scanning and removal" for developers on WordPress.com',
					components: {
						backupsLink: (
							<a
								href={ localizeUrl( '/support/restore' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						malwareScanningLink: (
							<a
								href={ localizeUrl( '/support/malware-and-site-security' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						siteMonitoringLink: (
							<a
								href={ localizeUrl( '/support/site-monitoring' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			),
			linkLearnMore: '#',
		},
	];
};
