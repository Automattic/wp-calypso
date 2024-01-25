import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { handleClickLink } from './handle-click-link';

export const useFeaturesList = () => {
	const translate = useTranslate();

	return [
		{
			id: 'sftp-ssh-wp-cli',
			title: translate( 'SFTP, SSH, and WP-CLI', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Run WP-CLI commands, automate repetitive tasks, and troubleshoot your custom code with the tools you already use.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( '/support/connect-to-ssh-on-wordpress-com' ),
		},
		{
			id: 'staging-sites',
			title: translate( 'Staging sites', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Test changes on a WordPress.com staging site first, so you can identify and fix any vulnerabilities before they impact your live site.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( '/support/how-to-create-a-staging-site/' ),
		},
		{
			id: 'custom-code',
			title: translate( 'Custom code', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Build anything with support and automatic updates for 50,000+ plugins and themes. Or start from scratch with your own custom code.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( '/support/code' ),
		},
		{
			id: 'free-ssl-certificates',
			title: translate( 'Free SSL certificates', {
				comment: 'Feature title',
			} ),
			description: translate(
				'Take your site from HTTP to HTTPS at no additional cost. We encrypt every domain registered and connected to WordPress.com with a free SSL certificate.',
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( '/support/domains/https-ssl' ),
		},
		{
			id: 'expert-support',
			title: translate( '24/7 expert support', {
				comment: 'Feature title',
			} ),
			description: translate(
				"Whenever you're stuck, whatever you're trying to make happen—our Happiness Engineers have the answers.",
				{
					comment: 'Feature description',
				}
			),
			linkLearnMore: localizeUrl( '/support/help-support-options' ),
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
								href={ localizeUrl( '/support/restore' ) }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleClickLink }
							/>
						),
						malwareScanningLink: (
							<a
								href={ localizeUrl( '/support/malware-and-site-security' ) }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleClickLink }
							/>
						),
						siteMonitoringLink: (
							<a
								href={ localizeUrl( '/support/site-monitoring' ) }
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
