import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useHandleClickLink } from './use-handle-click-link';

export const useFeaturesList = () => {
	const translate = useTranslate();
	const handleClickLink = useHandleClickLink();

	return [
		{
			id: 'connect-to-ssh-on-wordpress-com',
			title: translate( 'SFTP, SSH, and WP-CLI', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Run WP-CLI commands, automate repetitive tasks, and troubleshoot your custom code with the tools you already use.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( 'https://developer.wordpress.com/docs/developer-tools/wp-cli/' ),
		},
		{
			id: 'how-to-create-a-staging-site',
			title: translate( 'Staging sites', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Test changes on a WordPress.com staging site first, so you can identify and fix any vulnerabilities before they impact your live site.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl(
				'https://developer.wordpress.com/docs/developer-tools/staging-sites/'
			),
		},
		{
			id: 'multi-site-management',
			title: translate( 'Multiple site management', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Manage multiple WordPress sites from one place, get volume discounts on hosting products, and earn up to 50% revenue share when you migrate sites to our platform and refer our products to clients.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( 'https://wordpress.com/for-agencies?ref=wpcom-dev-dashboard' ),
		},
		{
			id: 'code',
			title: translate( 'Custom code', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Build anything with support and automatic updates for 50,000+ plugins and themes. Or start from scratch with your own custom code.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( 'https://wordpress.com/support/code' ),
		},
		{
			id: 'https-ssl',
			title: translate( 'Free SSL certificates', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Take your site from HTTP to HTTPS at no additional cost. We encrypt every domain registered and connected to WordPress.com with a free SSL certificate.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( 'https://wordpress.com/support/domains/https-ssl' ),
		},
		{
			id: 'help-support-options',
			title: translate( '24/7 expert support', {
				comment: 'Feature title',
			} ),
			description: translate(
				"Whenever you're stuck, whatever you're trying to make happen—our Happiness Engineers have the answers.",
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( 'https://developer.wordpress.com/docs/support/' ),
		},
		{
			id: 'malware-scanning-removal',
			title: translate( 'Malware scanning and removal', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Secure and maintain your site effortlessly with {{backupsLink}}real-time backups{{/backupsLink}}, advanced {{malwareScanningLink}}malware scanning and removal{{/malwareScanningLink}}, and continuous {{siteMonitoringLink}}site monitoring{{/siteMonitoringLink}}—ensuring peak performance and security at all times.',
				{
					comment: 'Feature description',
					components: {
						backupsLink: (
							<a
								id="restore"
								href={ localizeUrl(
									'https://developer.wordpress.com/docs/platform-features/real-time-backup-restore/'
								) }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleClickLink }
							/>
						),
						malwareScanningLink: (
							<a
								id="malware-and-site-security"
								href={ localizeUrl(
									'https://developer.wordpress.com/docs/platform-features/jetpack-scan/'
								) }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleClickLink }
							/>
						),
						siteMonitoringLink: (
							<a
								id="site-monitoring"
								href={ localizeUrl(
									'https://developer.wordpress.com/docs/troubleshooting/site-monitoring/'
								) }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleClickLink }
							/>
						),
					},
				}
			),
		},
	];
};
