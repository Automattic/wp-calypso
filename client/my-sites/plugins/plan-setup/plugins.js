import i18n from 'lib/mixins/i18n';

export default [
	{
		name: i18n.translate( 'Akismet' ),
		description: i18n.translate( 'Say goodbye to comment spam' ),
		buttonDescription: i18n.translate( 'Start using Akismet' ),
		buttonHref: 'https://en.support.wordpress.com/setting-up-premium-services/',
		isBusiness: true,
		isPremium: true
	},
	{
		name: i18n.translate( 'Polldaddy' ),
		description: i18n.translate( 'Create surveys and polls' ),
		buttonDescription: i18n.translate( 'Start using Polldaddy' ),
		buttonHref: 'https://en.support.wordpress.com/setting-up-premium-services/',
		isBusiness: true,
		isPremium: false
	},
	{
		name: i18n.translate( 'VaultPress' ),
		description: i18n.translate( 'Backup your site' ),
		buttonDescription: i18n.translate( 'Start using VaultPress' ),
		buttonHref: 'https://en.support.wordpress.com/setting-up-premium-services/',
		isBusiness: true,
		isPremium: true
	}
];
