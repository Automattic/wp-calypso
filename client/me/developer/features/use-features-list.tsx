import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useHandleClickLink } from './use-handle-click-link';

export const useFeaturesList = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
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
			title: hasEnTranslation( 'Agency Hosting' )
				? translate( 'Agency Hosting', {
						comment: 'Feature title',
				  } )
				: translate( 'Multiple site management', {
						comment: 'Feature title',
				  } ),
			description: hasEnTranslation(
				"Earn up to 50% revenue share and get volume discounts on WordPress.com hosting when you migrate sites to our platform and promote Automattic's products to clients."
			)
				? translate(
						"Earn up to 50% revenue share and get volume discounts on WordPress.com hosting when you migrate sites to our platform and promote Automattic's products to clients.",
						{
							comment: 'Feature description',
						}
				  )
				: translate(
						'Manage multiple WordPress sites from one place, get volume discounts on hosting products, and earn up to 50% revenue share when you migrate sites to our platform and refer our products to clients.',
						{
							comment: 'Feature description',
						}
				  ),
			linkLearnMore: localizeUrl( 'https://wordpress.com/for-agencies?ref=wpcom-dev-dashboard' ),
			linkTarget: '_self',
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
			linkLearnMore: localizeUrl( 'https://developer.wordpress.com/docs/glance/support/' ),
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
							<InlineSupportLink
								supportPostId={ 99415 }
								supportLink="https://developer.wordpress.com/docs/platform-features/real-time-backup-restore/"
								showIcon={ false }
								onClick={ handleClickLink }
							/>
						),
						malwareScanningLink: (
							<InlineSupportLink
								supportPostId={ 99380 }
								supportLink="https://developer.wordpress.com/docs/platform-features/jetpack-scan/"
								showIcon={ false }
								onClick={ handleClickLink }
							/>
						),
						siteMonitoringLink: (
							<InlineSupportLink
								supportPostId={ 99421 }
								supportLink="https://developer.wordpress.com/docs/troubleshooting/site-monitoring/"
								showIcon={ false }
								onClick={ handleClickLink }
							/>
						),
					},
				}
			),
		},
	];
};
